export class AnyApi {
    constructor(public http: any) {
        
    }
    getList(id: number): Promise<{ foo: 'bar' }> {
        return this.http.get('list.json')
    }
}