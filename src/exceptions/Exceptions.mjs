const Exceptions = {
  EMPLOYEE_ALREADY_EXISTS: (id) => `employee ${id} already exists`,
  EMPLOYEE_NOT_FOUND: (id) => `employee ${id} not found`,
  INVALID_EMPLOYEE_TYPE: (obj) => `${obj} is not Employee object`,
};

export default Exceptions;
