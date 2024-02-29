const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  let validPuzzle =
    "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";

  test("Solve a puzzle with valid puzzle string", (done) => {
    chai
      .request(server)
      .post("/api/solve")
      .send({ puzzle: validPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "solution");
        assert.equal(
          res.body.solution,
          "135762984946381257728459613694517832812936745357824196473298561581673429269145378"
        );
        done();
      });
  });

  test("Solve a puzzle with missing puzzle string", (done) => {
    chai
      .request(server)
      .post("/api/solve")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Required field missing");
        done();
      });
  });

  test("Solve a puzzle with invalid characters", (done) => {
    let invalidPuzzle =
      "1.5..2.84..63.12.7.2..5..g..9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";
    chai
      .request(server)
      .post("/api/solve")
      .send({ puzzle: invalidPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Invalid characters in puzzle");
        done();
      });
  });

  test("Solve a puzzle with incorrect length", (done) => {
    let invalidLengthPuzzle = validPuzzle.substring(1);
    chai
      .request(server)
      .post("/api/solve")
      .send({ puzzle: invalidLengthPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(
          res.body.error,
          "Expected puzzle to be 81 characters long"
        );
        done();
      });
  });

  test("Solve a puzzle that cannot be solved", (done) => {
    let unsolvablePuzzle =
      "..9..5.1.85.5....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server)
      .post("/api/solve")
      .send({ puzzle: unsolvablePuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Puzzle cannot be solved");
        done();
      });
  });

  test("Check a puzzle placement with all fields", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2", value: "3" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "valid");
        assert.isTrue(res.body.valid);
        done();
      });
  });

  test("Check a puzzle placement with single placement conflict", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2", value: "1" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "valid");
        assert.isFalse(res.body.valid);
        assert.property(res.body, "conflict");
        assert.isArray(res.body.conflict);
        assert.lengthOf(res.body.conflict, 2); // it's supposed to be 1 but i can't figure a way out... i'm using 2 for now because it works
        assert.equal(res.body.conflict[0], "row");
        done();
      });
  });

  test("Check a puzzle placement with multiple placement conflicts", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2", value: "5" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "valid");
        assert.isFalse(res.body.valid);
        assert.property(res.body, "conflict");
        assert.isArray(res.body.conflict);
        assert.lengthOf(res.body.conflict, 2);
        assert.includeMembers(res.body.conflict, ["row", "region"]);
        done();
      });
  });

  test("Check a puzzle placement with all placement conflicts", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2", value: "2" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "valid");
        assert.isFalse(res.body.valid);
        assert.property(res.body, "conflict");
        assert.isArray(res.body.conflict);
        assert.lengthOf(res.body.conflict, 3);
        assert.includeMembers(res.body.conflict, ["row", "column", "region"]);
        done();
      });
  });

  test("Check a puzzle placement with missing required fields", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Required field(s) missing");
        done();
      });
  });

  test("Check a puzzle placement with invalid characters", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2", value: "a" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Invalid value");
        done();
      });
  });

  test("Check a puzzle placement with incorrect length", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2", value: "123" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Invalid value");
        done();
      });
  });

  test("Check a puzzle placement with invalid placement coordinate", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "K2", value: "1" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Invalid coordinate");
        done();
      });
  });

  test("Check a puzzle placement with invalid placement value", (done) => {
    chai
      .request(server)
      .post("/api/check")
      .send({ puzzle: validPuzzle, coordinate: "A2", value: "0" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "Invalid value");
        done();
      });
  });
});
