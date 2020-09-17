export class Queue<T> {

    public length: number;
    private array: T[];

    constructor() {
        this.array = new Array<T>();
        this.length = 0;
    }

    public add(item: T) {
        this.array.push(item);
        this.length++;
    }    

    public extract() {
        if (this.length > 0) {
            this.length--;
            return this.array.splice(0, 1)[0]; 
        }               
    }

    public clear() {
        this.array = [];
        this.length = 0;
    }

    public uniqueAdd(item: T){
        if (!this.isItemAdded(item)) {
            this.add(item);
        }
    }

    private isItemAdded(item: T) {
        for (let i = 0; i < this.array.length; i++) {  
            if (JSON.stringify(this.array[i]) === JSON.stringify(item) ) {
                return true;
            }      
        }
        return false;
    }
}