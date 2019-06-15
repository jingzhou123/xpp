export class AnyApi {
    getList(id: number): Promise<{ foo: "bar"; }> {
        return Promise.resolve({})
    }

    getList1(id: number): Promise<string> {
        return Promise.resolve("randomString")
    }

    getList2(id: number): Promise<number> {
        return Promise.resolve(84)
    }

    getList3(id: number): Promise<void> {
        return Promise.resolve()
    }

    getList4(id: number): Promise<boolean> {
        return Promise.resolve(true)
    }
}
