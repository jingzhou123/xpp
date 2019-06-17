interface IGetList0Resp {
    foo: 'bar'
}
export class AnyApi {
    constructor(public http: any) {

    }
    getList(id: number): Promise<{ foo: 'bar' }> {
        return Promise.resolve({
            foo: "bar",
        })
    }
    getList0(id: number): Promise<IGetList0Resp> {
        return Promise.resolve({
            foo: "bar",
        })
    }
    getList1(id: number): Promise<string> {
        return Promise.resolve('any-ramdom-string')
    }
    getList2(id: number): Promise<number> {
        return Promise.resolve(100020)
    }
    getList3(id: number): Promise<void> {
        return Promise.resolve()
    }
    getList4(id: number): Promise<boolean> {
        return Promise.resolve(true)
    }
    getList5(id: number): Promise<{ foo: { foo: { foo: 'bar' }[] }[] }> {
        return Promise.resolve({
            foo: [
            {
                foo: [
                {
                    foo: "bar",
                }, 
                {
                    foo: "bar",
                }, 
                ],
            }, 
            {
                foo: [
                {
                    foo: "bar",
                }, 
                {
                    foo: "bar",
                }, 
                ],
            }, 
            ],
        })
    }
}