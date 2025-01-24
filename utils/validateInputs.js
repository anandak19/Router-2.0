export const validateInput = {
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   * @param {string} phoneNumber
   * @returns {boolean}
   */
  validatePhoneNumber: (phoneNumber) => {
    const phoneRegex = /^(\+?\d{1,4}[- ]?)?\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
  },
  /**
   * Validate username format
   * @param {string} userName
   * @returns {boolean}
   */
  validateUserName: (userName) => {
    // Accepts alphanumeric characters, underscores, and no spaces, 3-20 characters long
    const userNameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return userNameRegex.test(userName);
  },
};
