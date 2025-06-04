import { get, set, unset } from "lodash";
import { Database } from 'bun:sqlite';

export enum ErrorKind {
    MissingValue = "MISSING_VALUE",
    ParseException = "PARSE_EXCEPTION",
    InvalidType = "INVALID_TYPE",
}

export type DataLike<T = any> = { id: string; value: T };
export type Table = Map<string, any>;

export interface IDriver {
    prepare(table: string): Promise<void>;
    getAllRows(table: string): Promise<{ id: string; value: unknown }[]>;
    getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]>;
    getStartsWith(table: string, query: string): Promise<{ id: string; value: unknown }[]>;
    setRowByKey<T>(table: string, key: string, value: unknown, update: boolean): Promise<T>;
    deleteAllRows(table: string): Promise<number>;
    deleteRowByKey(table: string, key: string): Promise<number>;
}

class BunSqliteDriver implements IDriver {
    private static instance: BunSqliteDriver | null = null;
    private readonly _database: Database;

    get database(): Database {
        return this._database;
    }

    constructor(path: string) {
        this._database = new Database(path);
    }

    public static createSingleton(path: string): BunSqliteDriver {
        if (!BunSqliteDriver.instance) BunSqliteDriver.instance = new BunSqliteDriver(path);
        return BunSqliteDriver.instance;
    }

    public async prepare(table: string): Promise<void> {
        this._database.exec(`CREATE TABLE IF NOT EXISTS ${table} (ID TEXT PRIMARY KEY, json TEXT)`);
    }

    public async getAllRows(table: string): Promise<{ id: string; value: unknown }[]> {
        const prep = this._database.prepare<{ ID: string; json: string }, []>(`SELECT * FROM ${table}`);
        return prep.all().map((r) => ({
            id: r.ID,
            value: JSON.parse(r.json),
        }));
    }

    public async getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]> {
        const value = (await this._database
            .prepare(`SELECT json FROM ${table} WHERE ID = $key`)
            .get({ $key: key })) as {
                ID: string;
                json: string;
            };
        return value != null ? [JSON.parse(value.json), true] : [null, false];
    }

    public async getStartsWith(table: string, query: string): Promise<{ id: string; value: unknown }[]> {
        const prep = this._database.prepare<{ ID: string; json: string }, []>(
            `SELECT * FROM ${table} WHERE ID LIKE '${query}%'`,
        );
        return prep.all().map((r) => ({
            id: r.ID,
            value: JSON.parse(r.json),
        }));
    }

    public async setRowByKey<T>(table: string, key: string, value: unknown, update: boolean): Promise<T> {
        const stringified_json = JSON.stringify(value);
        if (update) this._database.prepare(`UPDATE ${table} SET json = (?) WHERE ID = (?)`).run(stringified_json, key);
        else this._database.prepare(`INSERT INTO ${table} (ID,json) VALUES (?,?)`).run(key, stringified_json);
        return value as T;
    }

    public async deleteAllRows(table: string): Promise<number> {
        this._database.prepare(`DELETE FROM ${table}`).run();
        return 1;
    }

    public async deleteRowByKey(table: string, key: string): Promise<number> {
        this._database.prepare(`DELETE FROM ${table} WHERE ID=$key`).run({ $key: key });
        return 1;
    }
}

export class KxsDB<D = any> {
    private tableName: string;
    private path: string;
    private driver: BunSqliteDriver;
    private mirrors: KxsDB[] = [];

    constructor(options: {
        table?: string;
        filePath?: string;
    } = {}) {
        options.table ??= "json";
        options.filePath ??= "database.sqlite";
        this.tableName = options.table;
        this.path = options.filePath;
        this.driver = new BunSqliteDriver(this.path);

        this.prepare(this.tableName);
    }


    private createError(message: string, kind: ErrorKind): Error {
        const error = new Error(message);
        error.name = kind;
        Object.defineProperty(error, 'kind', {
            value: kind,
            writable: false
        });
        return error;
    }


    private async prepare(table: string): Promise<void> {
        await this.driver.prepare(table);

        for (const mirror of this.mirrors) {
            await mirror.prepare(table);
        }
    }

    private async getAllRows(
        table: string
    ): Promise<{ id: string; value: any }[]> {
        return this.driver.getAllRows(table);
    }

    private async getRowByKey<T>(
        table: string,
        key: string
    ): Promise<[T | null, boolean]> {
        return this.driver.getRowByKey<T>(table, key);
    }

    private async getStartsWith(
        table: string,
        query: string
    ): Promise<{ id: string; value: any }[]> {
        return this.driver.getStartsWith(table, query);
    }

    private async setRowByKey<T>(
        table: string,
        key: string,
        value: any,
        update: boolean
    ): Promise<T> {
        const result = await this.driver.setRowByKey<T>(table, key, value, update);

        for (const mirror of this.mirrors) {
            await mirror.setRowByKey(table, key, value, update);
        }
        return result;
    }

    private async deleteAllRows(table: string): Promise<number> {
        const result = await this.driver.deleteAllRows(table);

        for (const mirror of this.mirrors) {
            await mirror.deleteAllRows(table);
        }

        return result;
    }

    private async deleteRowByKey(table: string, key: string): Promise<number> {
        const result = await this.driver.deleteRowByKey(table, key);

        for (const mirror of this.mirrors) {
            await mirror.deleteRowByKey(table, key);
        }

        return result;
    }


    private async addSubtract(
        key: string,
        value: number,
        sub = false
    ): Promise<number> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        if (value == null) {
            throw this.createError(
                "Missing second argument (value)",
                ErrorKind.MissingValue
            );
        }

        let currentNumber = await this.get<number>(key);

        if (currentNumber == null) currentNumber = 0;
        if (typeof currentNumber != "number") {
            try {
                currentNumber = parseFloat(currentNumber as string);
            } catch (_) {
                throw this.createError(
                    `Current value with key: (${key}) is not a number and couldn't be parsed to a number`,
                    ErrorKind.InvalidType
                );
            }
        }

        if (typeof value != "number") {
            try {
                value = parseFloat(value as string);
            } catch (_) {
                throw this.createError(
                    `Value to add/subtract with key: (${key}) is not a number and couldn't be parsed to a number`,
                    ErrorKind.InvalidType
                );
            }
        }

        sub ? (currentNumber -= value) : (currentNumber += value);
        await this.set<number>(key, currentNumber);
        return currentNumber;
    }

    private async getArray<T = D>(key: string): Promise<T[]> {
        const currentArr = (await this.get<T[]>(key)) ?? [];

        if (!Array.isArray(currentArr)) {
            throw this.createError(
                `Current value with key: (${key}) is not an array`,
                ErrorKind.InvalidType
            );
        }

        return currentArr;
    }

    async all<T = D>(): Promise<{ id: string; value: T }[]> {
        return this.getAllRows(this.tableName);
    }

    async get<T = D>(key: string): Promise<T | null> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        if (key.includes(".")) {
            const keySplit = key.split(".");
            const [result] = await this.getRowByKey<T>(
                this.tableName,
                keySplit[0]
            );
            return get(result, keySplit.slice(1).join("."));
        }

        const [result] = await this.getRowByKey<T>(this.tableName, key);
        return result;
    }

    async set<T = D>(key: string, value: T): Promise<T> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        if (value == null) {
            throw this.createError(
                "Missing second argument (value)",
                ErrorKind.MissingValue
            );
        }

        if (key.includes(".")) {
            const keySplit = key.split(".");
            const [result, exist] = await this.getRowByKey(
                this.tableName,
                keySplit[0]
            );

            let obj: object;
            if (result instanceof Object == false) {
                obj = {};
            } else {
                obj = result as object;
            }

            const valueSet = set<T>(
                obj ?? {},
                keySplit.slice(1).join("."),
                value
            );
            return this.setRowByKey(
                this.tableName,
                keySplit[0],
                valueSet,
                exist
            );
        }

        const exist = (await this.getRowByKey(this.tableName, key))[1];
        return this.setRowByKey(this.tableName, key, value, exist);
    }

    async update<T = D>(key: string, object: object): Promise<T> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        if (typeof object != "object" || object == null) {
            throw this.createError(
                `Second argument (object) needs to be an object received "${typeof object}"`,
                ErrorKind.InvalidType
            );
        }

        const data = (await this.get<any>(key)) ?? {};
        if (typeof data != "object" || Array.isArray(data)) {
            throw this.createError(
                `The current data is not an object, update only works on objects`,
                ErrorKind.InvalidType
            );
        }

        for (const [k, v] of Object.entries(object)) {
            data[k] = v;
        }

        return await this.set(key, data);
    }

    async has(key: string): Promise<boolean> {
        return (await this.get(key)) != null;
    }

    async delete(key: string): Promise<number> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        if (key.includes(".")) {
            const keySplit = key.split(".");
            const obj = (await this.get<any>(keySplit[0])) ?? {};
            unset(obj, keySplit.slice(1).join("."));
            return this.set(keySplit[0], obj);
        }

        return this.deleteRowByKey(this.tableName, key);
    }

    async deleteAll(): Promise<number> {
        return this.deleteAllRows(this.tableName);
    }

    async add(key: string, value: number): Promise<number> {
        return this.addSubtract(key, value);
    }

    async sub(key: string, value: number): Promise<number> {
        return this.addSubtract(key, value, true);
    }

    async push<T = D>(key: string, ...values: T[]): Promise<T[]> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        if (values.length === 0) {
            throw this.createError(
                "Missing second argument (value)",
                ErrorKind.MissingValue
            );
        }

        const currentArr = await this.getArray<T>(key);
        currentArr.push(...values);

        return this.set(key, currentArr);
    }

    async unshift<T = D>(key: string, value: T | T[]): Promise<T[]> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }
        if (value == null) {
            throw this.createError(
                "Missing second argument (value)",
                ErrorKind.InvalidType
            );
        }

        let currentArr = await this.getArray<T>(key);
        if (Array.isArray(value)) currentArr = value.concat(currentArr);
        else currentArr.unshift(value);

        return await this.set(key, currentArr);
    }

    async pop<T = D>(key: string): Promise<T | undefined> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        const currentArr = await this.getArray<T>(key);
        const value = currentArr.pop();
        await this.set(key, currentArr);

        return value;
    }

    async shift<T = D>(key: string): Promise<T | undefined> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }

        const currentArr = await this.getArray<T>(key);
        const value = currentArr.shift();

        await this.set(key, currentArr);

        return value;
    }

    async pull<T = D>(
        key: string,
        value: T | T[] | ((data: T, index: string) => boolean),
        once = false
    ): Promise<T[]> {
        if (typeof key != "string") {
            throw this.createError(
                `First argument (key) needs to be a string received "${typeof key}"`,
                ErrorKind.InvalidType
            );
        }
        if (value == null) {
            throw this.createError(
                "Missing second argument (value)",
                ErrorKind.MissingValue
            );
        }

        const currentArr = await this.getArray<T>(key);
        if (!Array.isArray(value) && typeof value != "function")
            value = [value];

        const data = [];
        for (const i in currentArr) {
            if (
                Array.isArray(value)
                    ? value.includes(currentArr[i])
                    : (value as any)(currentArr[i], i)
            )
                continue;
            data.push(currentArr[i]);
            if (once) break;
        }

        return await this.set(key, data);
    }

    async startsWith<T = D>(
        query: string
    ): Promise<{ id: string; value: T }[]> {
        if (typeof query != "string") {
            throw this.createError(
                `First argument (query) needs to be a string received "${typeof query}"`,
                ErrorKind.InvalidType
            );
        }

        const results = await this.getStartsWith(this.tableName, query);
        return results;
    }

    async table<T = D>(table: string): Promise<KxsDB<T>> {
        if (typeof table != "string") {
            throw this.createError(
                `First argument (table) needs to be a string received "${typeof table}"`,
                ErrorKind.InvalidType
            );
        }

        const newDB = new KxsDB({
            table: table,
            filePath: this.path
        });

        await newDB.prepare(table);

        return newDB;
    }
}