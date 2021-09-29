const book1 = {
    name: "Book One",
    author: "John Doe",
    year: "2018",
    getSummary() {
        return `${this.name} kitobi ${this.author} tomonidan ${this.year} yili chop etilgan`;
    },
};

const book2 = {
    name: "Book two",
    author: "John",
    year: "2018",
    getSummary() {
        return `${this.name} kitobi ${this.author} tomonidan ${this.year} yili chop etilgan`;
    },
};

console.log(book1.getSummary());
