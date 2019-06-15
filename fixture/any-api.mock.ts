export class AnyApi {
    getList(): Promise<{ foo: "bar"; }> {
        return Promise.resolve({})
    }
}
