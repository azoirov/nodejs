function Book(name, author, year) {
    this.name = name;
    this.author = author;
    this.year = year;
}

Book.prototype.getSummary = function () {
    return `${this.name} was written by ${this.author} in ${this.year}`;
};

// inheritance
// Magazine.prototype = Object.create(Book.prototype);

function Magazine(name, author, year) {
    this.name = name;
    this.author = author;
    this.year = year;
}

let mag1 = new Magazine("Magazine", "Somebody", 2021);

console.log(mag1.getSummary());
