class Book {
    constructor(name, author, year) {
        this.name = name;
        this.author = author;
        this.year = year;
    }

    getSummary() {
        return `${this.name} kitobi ${this.author} tomonidan ${this.year} yili chop etilgan`;
    }
}

class Magazine extends Book {
    constructor(name, author, year) {
        super(name, author, year);
    }
}

let mag1 = new Magazine("Jurnal", "Kimdir", 2019);
console.log(mag1);
