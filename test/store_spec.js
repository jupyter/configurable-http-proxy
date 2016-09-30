// jshint jasmine: true

var storeProvider = require("../lib/store.js");

describe("ExternalStore", function () {
  beforeEach(function () {
    this.subject = storeProvider.ExternalStore("./test/support/external_store");
  });

  afterEach(function (done) {
    require("fs").unlink("./teststore.db", done);
  });

  describe("get", function () {
    it("returns the data for the specified path", function (done) {
      var store = this.subject;

      store.add("/my_route", { "test": "value" }, function () {
        store.get("/my_route", function (route) {
          expect(route).toEqual({ test: "value" });
          done();
        });
      });
    });

    it("returns undefined when not found", function (done) {
      this.subject.get("/wut", function (route) {
        expect(route).toBe(undefined);
        done();
      });
    });
  });

  describe("getTarget", function () {
    it("returns the target object for the path", function (done) {
      var store = this.subject;

      store.add("/my_route", { "target": "http://localhost:8213" }, function () {
        store.getTarget("/my_route", function (target) {
          expect(target.prefix).toEqual("/my_route");
          expect(target.data.target).toEqual("http://localhost:8213");
          done();
        });
      });
    });

    it("returns undefined when target not found", function (done) {
      this.subject.getTarget("/my_route", function (target) {
        expect(target).toBe(undefined);
        done();
      });
    });
  });

  describe("getAll", function () {
    it("returns all routes", function (done) {
      var store = this.subject;

      store.add("/my_route", { "test": "value1" }, function () {
        store.add("/my_other_route", { "test": "value2" }, function () {
          store.getAll(function (routes) {
            expect(Object.keys(routes).length).toEqual(2);
            expect(routes["/my_route"]).toEqual({ "test": "value1" });
            expect(routes["/my_other_route"]).toEqual({ "test": "value2" });
            done();
          });
        });
      });
    });

    it("returns a blank object when no routes defined", function (done) {
      this.subject.getAll(function (routes) {
        expect(routes).toEqual({});
        done();
      });
    });
  });

  describe("add", function () {
    it("adds data to the store for the specified path", function (done) {
      var store = this.subject;

      store.add("/my_route", { "test": "value" }, function () {
        store.get("/my_route", function (route) {
          expect(route).toEqual({ "test": "value" });
          done();
        });
      });
    });

    it("overwrites any existing values", function (done) {
      var store = this.subject;

      store.add("/my_route", { "test": "value" }, function () {
        store.add("/my_route", { "test": "updatedValue" }, function () {
          store.get("/my_route", function (route) {
            expect(route).toEqual({ "test": "updatedValue" });
            done();
          });
        });
      });
    });
  });

  describe("update", function () {
    it("merges supplied data with existing data", function (done) {
      var store = this.subject;

      store.add("/my_route", { "version": 1, "test": "value" }, function () {
        store.update("/my_route", { "version": 2 }, function () {
          store.get("/my_route", function (route) {
            expect(route.version).toEqual(2);
            expect(route.test).toEqual("value");
            done();
          });
        });
      });
    });
  });

  describe("remove", function () {
    it("removes a route from the table", function (done) {
      var store = this.subject;

      store.add("/my_route", { "test": "value" }, function () {
        store.remove("/my_route", function () {
          store.get("/my_route", function (route) {
            expect(route).toBe(undefined);
            done();
          });
        });
      });
    });

    it("doesn't explode when route is not defined", function (done) {
      // would blow up if an error was thrown
      this.subject.remove("/my_route", done);
    });
  });

  describe("hasRoute", function () {
    it("returns false when the path is not found", function (done) {
      var store = this.subject;

      store.add("/my_route", { "test": "value" }, function () {
        store.hasRoute("/my_route", function (result) {
          expect(result).toBe(true);
          done();
        });
      });
    });

    it("returns false when the path is not found", function (done) {
      this.subject.hasRoute("/wut", function (result) {
        expect(result).toBe(false);
        done();
      });
    });
  });
});

describe("MemoryStore", function () {
  beforeEach(function () {
    this.subject = storeProvider.MemoryStore();
  });

  describe("get", function () {
    it("returns the data for the specified path", function (done) {
      this.subject.add("/my_route", { "test": "value" });

      this.subject.get("/my_route", function (data) {
        expect(data).toEqual({ "test": "value" });
        done();
      });
    });

    it("returns undefined when not found", function () {
      expect(this.subject.get("/wut")).toBe(undefined);
    });
  });

  describe("getTarget", function () {
    it("returns the target object for the path", function (done) {
      this.subject.add("/my_route", { "target": "http://localhost:8213" });

      this.subject.getTarget("/my_route", function (target) {
        expect(target.prefix).toEqual("/my_route");
        expect(target.data.target).toEqual("http://localhost:8213");
        done();
      });
    });
  });

  describe("getAll", function () {
    it("returns all routes", function (done) {
      this.subject.add("/my_route", { "test": "value1" });
      this.subject.add("/my_other_route", { "test": "value2" });

      this.subject.getAll(function (routes) {
        expect(Object.keys(routes).length).toEqual(2);
        expect(routes["/my_route"]).toEqual({ "test": "value1" });
        expect(routes["/my_other_route"]).toEqual({ "test": "value2" });
        done();
      });
    });

    it("returns a blank object when no routes defined", function (done) {
      this.subject.getAll(function (routes) {
        expect(routes).toEqual({});
        done();
      });
    });
  });

  describe("add", function () {
    it("adds data to the store for the specified path", function (done) {
      this.subject.add("/my_route", { "test": "value" });

      this.subject.get("/my_route", function (route) {
        expect(route).toEqual({ "test": "value" });
        done();
      });
    });

    it("overwrites any existing values", function (done) {
      this.subject.add("/my_route", { "test": "value" });
      this.subject.add("/my_route", { "test": "updatedValue" });

      this.subject.get("/my_route", function (route) {
        expect(route).toEqual({ "test": "updatedValue" });
        done();
      });
    });
  });

  describe("update", function () {
    it("merges supplied data with existing data", function (done) {
      this.subject.add("/my_route", { "version": 1, "test": "value" });
      this.subject.update("/my_route", { "version": 2 });

      this.subject.get("/my_route", function (route) {
        expect(route.version).toEqual(2);
        expect(route.test).toEqual("value");
        done();
      });
    });
  });

  describe("remove", function () {
    it("removes a route from the table", function (done) {
      this.subject.add("/my_route", { "test": "value" });
      this.subject.remove("/my_route");

      this.subject.get("/my_route", function (route) {
        expect(route).toBe(undefined);
        done();
      });
    });

    it("doesn't explode when route is not defined", function (done) {
      // would blow up if an error was thrown
      this.subject.remove("/my_route", done);
    });
  });

  describe("hasRoute", function () {
    it("returns false when the path is not found", function (done) {
      this.subject.add("/my_route", { "test": "value" });
      this.subject.hasRoute("/my_route", function (result) {
        expect(result).toBe(true);
        done();
      });
    });

    it("returns false when the path is not found", function (done) {
      this.subject.hasRoute("/wut", function (result) {
        expect(result).toBe(false);
        done();
      });
    });
  });
});
