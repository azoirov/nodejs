class Book {
    constructor(name, author, year) {
        this.name = name;
        this.author = author;
        this.year = year;
    }

    getSummary() {
        this.#test();
        return `${this.name} kitobi ${this.author} tomonidan ${this.year} yili chop etilgan`;
    }

    static getAge() {
        return "static method";
    }

    #test() {
        console.log("Private method");
    }
}

console.log(Book.getAge());

const book1 = new Book("Node.js", "Rayn Dal", 2009);
const book2 = new Book("Node.js", "Rayn Dal", 2010);

console.log(book1.getSummary());
console.log(book2.getSummary());

// console.log(book1.getAge());
