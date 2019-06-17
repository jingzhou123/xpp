interface IGetList0Resp {
    foo: 'bar'
}
export class AnyApi {
    constructor(public http: any) {
        
    }
    getList(id: number): Promise<{ foo: 'bar' }> {
        return this.http.get('list.json')
    }
    getList0(id: number): Promise<IGetList0Resp> {
        return this.http.get('list.json')
    }
    getList1(id: number): Promise<string> {
        return this.http.get('list.json')
    }
    getList2(id: number): Promise<number> {
        return this.http.get('list.json')
    }
    getList3(id: number): Promise<void> {
        return this.http.get('list.json')
    }
    getList4(id: number): Promise<boolean> {
        return this.http.get('list.json')
    }
    getList5(id: number): Promise<{ foo: { foo: { foo: 'bar' }[] }[] }> {
        return this.http.get('list.json')
    }
}