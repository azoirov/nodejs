function Book(name, author, year) {
    this.name = name;
    this.author = author;
    this.year = year;

    this.getSummary = function () {
        return `${this.name} kitobi ${this.author} tomonidan ${this.year} yili chop etilgan`;
    };
}

let book1 = new Book("Javascript", "John Doe", 2016);
let book2 = new Book("Node.js", "Rayn Dal", 2009);
console.log(book1.getSummary());
console.log(book2.getSummary());
