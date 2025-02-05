import { describe, it, beforeEach, expect } from "vitest";
import Company from "../src/service/Company.mjs";
import WageEmployee from "../src/dto/WageEmployee.mjs";
import Manager from "../src/dto/Manager.mjs";
import SalesPerson from "../src/dto/SalesPerson.mjs";
import Constants from "./constants.mjs";
import Exceptions from "../src/exceptions/exceptions.mjs";

describe("Company", () => {
  let company;
  let empl1, empl2, empl3;

  beforeEach(() => {
    company = new Company();
    empl1 = new WageEmployee(
      Constants.ID1,
      Constants.DEPARTMENT1,
      Constants.SALARY1,
      Constants.WAGE1,
      Constants.HOURS1
    );
    empl2 = new Manager(
      Constants.ID2,
      Constants.DEPARTMENT1,
      Constants.SALARY2,
      Constants.FACTOR1
    );
    empl3 = new SalesPerson(
      Constants.ID3,
      Constants.DEPARTMENT2,
      Constants.SALARY3,
      Constants.WAGE1,
      Constants.HOURS1,
      Constants.PERCENT1,
      Constants.SALES1
    );
    [empl1, empl2, empl3].forEach((empl) => company.addEmployee(empl));
  });

  it("testAddEmployee", async () => {
    const empl = new WageEmployee(
      Constants.ID4,
      Constants.DEPARTMENT1,
      Constants.SALARY1,
      Constants.WAGE1,
      Constants.HOURS1
    );
    await company.addEmployee(empl);
    await expect(company.addEmployee(empl)).rejects.toThrow(
      Exceptions.EMPLOYEE_ALREADY_EXISTS(Constants.ID4)
    );
    await expect(company.addEmployee(empl1)).rejects.toThrow(
      Exceptions.EMPLOYEE_ALREADY_EXISTS(Constants.ID1)
    );
  });

  it("testGetEmployee", async () => {
    expect(await company.getEmployee(Constants.ID1)).toEqual(empl1);
    expect(await company.getEmployee(Constants.ID4)).toBeUndefined();
  });

  it("testRemoveEmployee", async () => {
    expect(await company.removeEmployee(Constants.ID1)).toEqual(empl1);
    await expect(company.removeEmployee(Constants.ID1)).rejects.toThrow(
      Exceptions.EMPLOYEE_NOT_FOUND(Constants.ID1)
    );
  });

  it("testGetDepartmentBudget", async () => {
    expect(await company.getDepartmentBudget(Constants.DEPARTMENT1)).toEqual(
      Constants.SALARY1 +
        Constants.WAGE1 * Constants.HOURS1 +
        Constants.SALARY2 * Constants.FACTOR1
    );
    expect(await company.getDepartmentBudget(Constants.DEPARTMENT2)).toEqual(
      Constants.SALARY3 +
        Constants.WAGE1 * Constants.HOURS1 +
        (Constants.PERCENT1 * Constants.SALES1) / 100
    );
    expect(await company.getDepartmentBudget(Constants.DEPARTMENT4)).toEqual(0);
  });

  it("testGetDepartments", async () => {
    let expected = [Constants.DEPARTMENT1, Constants.DEPARTMENT2].sort();
    expect(await company.getDepartments()).toEqual(expected);
    await company.removeEmployee(Constants.ID3);
    expected = [Constants.DEPARTMENT1];
    expect(await company.getDepartments()).toEqual(expected);
  });

  it("persistenceTest", async () => {
    await company.saveToFile(Constants.DATA_FILE_NAME);
    const newCompany = new Company();
    await newCompany.restoreFromFile(Constants.DATA_FILE_NAME);
    expect(await newCompany.getEmployee(Constants.ID1)).toEqual(empl1);
    expect(await newCompany.getEmployee(Constants.ID2)).toEqual(empl2);
    expect(await newCompany.getEmployee(Constants.ID3)).toEqual(empl3);
  });

  it("testRemoveEmployeeFromDepartment", async () => {
    await company.removeEmployeeFromDepartment(empl1);
    expect(await company.getDepartmentBudget(Constants.DEPARTMENT1)).toEqual(
      Constants.SALARY2 * Constants.FACTOR1
    );
    await company.removeEmployeeFromDepartment(empl2);
    expect(await company.getDepartmentBudget(Constants.DEPARTMENT1)).toEqual(0);
  });

  it("testAddEmployeeToExistingDepartment", async () => {
    const empl = new WageEmployee(
      Constants.ID4,
      Constants.DEPARTMENT1,
      Constants.SALARY1,
      Constants.WAGE1,
      Constants.HOURS1
    );
    await company.addEmployee(empl);
    expect(await company.getDepartmentBudget(Constants.DEPARTMENT1)).toEqual(
      Constants.SALARY1 +
        Constants.WAGE1 * Constants.HOURS1 +
        Constants.SALARY2 * Constants.FACTOR1 +
        Constants.SALARY1 +
        Constants.WAGE1 * Constants.HOURS1
    );
  });

  it("testAddEmployeeToNewDepartment", async () => {
    const empl = new WageEmployee(
      Constants.ID4,
      Constants.DEPARTMENT3,
      Constants.SALARY1,
      Constants.WAGE1,
      Constants.HOURS1
    );
    await company.addEmployee(empl);
    expect(await company.getDepartmentBudget(Constants.DEPARTMENT3)).toEqual(
      Constants.SALARY1 + Constants.WAGE1 * Constants.HOURS1
    );
  });

  it("testGetManagersWithMostFactor", async () => {
    await company.addEmployee(
      new Manager(
        Constants.ID4,
        Constants.DEPARTMENT1,
        Constants.SALARY1,
        Constants.FACTOR2
      )
    );

    const managersExpected = [
      new Manager(
        Constants.ID5,
        Constants.DEPARTMENT1,
        Constants.SALARY1,
        Constants.FACTOR3
      ),
      new Manager(
        Constants.ID6,
        Constants.DEPARTMENT1,
        Constants.SALARY1,
        Constants.FACTOR3
      ),
      new Manager(
        Constants.ID7,
        Constants.DEPARTMENT2,
        Constants.SALARY1,
        Constants.FACTOR3
      ),
    ];

    for (const mng of managersExpected) {
      await company.addEmployee(mng);
    }

    expect(await company.getManagersWithMostFactor()).toEqual(managersExpected);

    await company.removeEmployee(Constants.ID4);
    await company.removeEmployee(Constants.ID5);
    await company.removeEmployee(Constants.ID6);
    await company.removeEmployee(Constants.ID7);

    expect(await company.getManagersWithMostFactor()).toEqual([empl2]);
    await company.removeEmployee(Constants.ID2);
    expect(await company.getManagersWithMostFactor()).toEqual([]);
  });

  it("testAddEmployeeWithInvalidAttributes", async () => {
    const invalidEmployee1 = new WageEmployee(
      Constants.ID10,
      Constants.DEPARTMENT1,
      Constants.SALARY1,
      Constants.WAGE1,
      Constants.HOURS1
    );
    const invalidEmployee2 = new WageEmployee(
      Constants.ID11,
      null,
      Constants.SALARY1,
      Constants.WAGE1,
      Constants.HOURS1
    );
    const invalidEmployee3 = new WageEmployee(
      Constants.ID12,
      Constants.DEPARTMENT1,
      -1,
      Constants.WAGE1,
      Constants.HOURS1
    );
    await company.addEmployee(invalidEmployee1);
    await company.addEmployee(invalidEmployee2);
    await company.addEmployee(invalidEmployee3);

    await expect(company.addEmployee(invalidEmployee1)).rejects.toThrow(
      Exceptions.EMPLOYEE_ALREADY_EXISTS(Constants.ID10)
    );
    await expect(company.addEmployee(invalidEmployee2)).rejects.toThrow(
      Exceptions.EMPLOYEE_ALREADY_EXISTS(Constants.ID11)
    );
    await expect(company.addEmployee(invalidEmployee3)).rejects.toThrow(
      Exceptions.EMPLOYEE_ALREADY_EXISTS(Constants.ID12)
    );
  });
  describe("async iterator test", () => {
    it("iterating all objects", async () => {
      await runTest([empl1, empl2, empl3], undefined, company);
    });
    it("iterating objects with basic salary greater than 1000", async () => {
      await runTest([empl2, empl3], (e) => e.getBasicSalary() > 1000, company);
    });
    it("iterating objects with basic salary less than 1000", async () => {
      await runTest([], (e) => e.getBasicSalary() < 1000, company);
    });
  });
  async function runTest(expected, predicate, company) {
    const comp = (e1, e2) => e1.getId() - e2.getId();
    company.setPredicate(predicate);
    expected = expected.toSorted(comp);
    const actual = [];
    for await (const empl of company) {
      actual.push(empl);
    }
    actual.sort(comp);
    expect(actual).toEqual(expected);
  }
});
