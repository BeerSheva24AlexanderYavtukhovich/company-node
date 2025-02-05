import Employee from "../dto/Employee.mjs";
import Manager from "../dto/Manager.mjs";
import Exceptions from "../exceptions/exceptions.mjs";

export default class Company {
  #employees;
  #departments;
  #predicate;
  constructor(predicate) {
    this.#employees = {};
    this.#departments = {};
    this.setPredicate(predicate);
    this.#setIterable();
  }
  #setIterable() {
    this[Symbol.iterator] = function* () {
      const values = Object.values(this.#employees);
      let indexCur = -1;

      while (true) {
        const { index, value } = this.#getNext(indexCur, values);
        if (!value) {
          break;
        }
        yield value;
        indexCur = index;
      }
    };
  }
  #getNext(index, values) {
    let value;
    index++;
    while ((value = values[index]) && !this.#predicate(value)) {
      index++;
    }
    return { index, value };
  }
  setPredicate(predicate) {
    this.#predicate = predicate ?? ((e) => true);
  }

  async addEmployee(employee) {
    if (!(employee instanceof Employee)) {
      throw Error(Exceptions.INVALID_EMPLOYEE_TYPE(employee));
    }
    if (this.#employees[employee.id]) {
      throw Error(Exceptions.EMPLOYEE_ALREADY_EXISTS(employee.id));
    }
    this.#employees[employee.id] = employee;
    const department = employee.department;

    if (!this.#departments[department]) {
      this.#departments[department] = [];
    }
    this.#departments[department].push(employee);
  }

  async getEmployee(id) {
    return this.#employees[id];
  }

  async removeEmployee(id) {
    if (!this.#employees[id]) {
      throw Error(Exceptions.EMPLOYEE_NOT_FOUND(id));
    }
    const removedEmployee = this.#employees[id];
    delete this.#employees[id];
    this.removeEmployeeFromDepartment(removedEmployee);
    return removedEmployee;
  }

  async getDepartmentBudget(department) {
    let budget = 0;
    const employeesInDepartment = this.#departments[department];
    if (employeesInDepartment) {
      budget = employeesInDepartment.reduce(
        (sum, employee) => sum + employee.computeSalary(),
        0
      );
    }
    return budget;
  }

  async getDepartments() {
    return Object.keys(this.#departments).sort();
  }

  removeEmployeeFromDepartment(employee) {
    const department = employee.department;
    const departmentEmployees = this.#departments[department];
    const index = departmentEmployees.findIndex(
      (empl) => empl.id === employee.id
    );
    if (index > -1) {
      departmentEmployees.splice(index, 1);
    }
    if (departmentEmployees.length === 0) {
      delete this.#departments[department];
    }
  }

  async saveToFile(fileName) {
    const fs = require("fs");
    const data = JSON.stringify(Object.values(this.#employees));
    fs.writeFileSync(fileName, data);
  }

  async restoreFromFile(fileName) {
    const fs = require("fs");
    if (fs.existsSync(fileName)) {
      const data = fs.readFileSync(fileName, "utf8");
      const employees = JSON.parse(data).map(Employee.fromPlainObject);
      employees.forEach((empl) => this.addEmployee(empl));
    }
  }

  async getManagersWithMostFactor() {
    const result = [];
    let i = 0;

    const managers = Object.values(this.#employees).filter(
      (employee) => employee instanceof Manager
    );

    if (managers.length > 0) {
      managers.sort((a, b) => b.getFactor() - a.getFactor());
      const maxFactor = managers[0].getFactor();

      while (i < managers.length && managers[i].getFactor() === maxFactor) {
        result.push(managers[i]);
        i++;
      }
    }

    return result;
  }
}
