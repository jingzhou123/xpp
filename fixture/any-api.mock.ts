export class AnyApi {
    getList(id: number): Promise<{ foo: "bar"; }> {
        return Promise.resolve({})
    }
}
