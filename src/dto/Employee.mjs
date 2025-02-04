export default class Employee {
  static classMap = {
    Employee: Employee,
  };
  constructor(id = -1, department = "", basicSalary = -1) {
    this.basicSalary = basicSalary;
    this.department = department;
    this.id = id;
    this.className = this.constructor.name;
  }
  computeSalary() {
    return this.basicSalary;
  }
  getId() {
    return this.id;
  }
  getBasicSalary() {
    return this.basicSalary;
  }
  getDepartment() {
    return this.department;
  }

  static fromPlainObject(plainObj) {
    const Cls = Employee.classMap[plainObj.className];
    return Object.assign(new Cls(), plainObj);
  }
}
