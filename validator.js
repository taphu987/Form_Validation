// Contructor function (Đối tượng Validator)
function Validator(options) {
  var selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorMessage = rule.test(inputElement.value);
    var errorElement = inputElement.parentElement.querySelector(
      options.errorSelector
    );

    // Lấy ra các rules của seletor
    var rules = selectorRules[rule.selector];

    // Lặp qua từng rule và kiểm tra, nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }

    return !errorMessage;
  }

  // Lấy Element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi submit form bỏ qua hành vi mặc định
    formElement.onsubmit = function (event) {
      event.preventDefault();

      var isFormValid = true;

      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );

          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            return (values[input.name] = input.value) && values;
          },
          {});
          options.onSubmit(formValues);
        }
        // Trường hợp submit với hành vi mặc định (html)
        else {
          formElement.submit();
        }
      }
    };

    // Lặp qua mỗi rule và xử lý(lắng nghe sự kiện blur, input...)
    options.rules.forEach(function (rule) {
      // Lưu lại các rule cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);
      var errorElement = inputElement.parentElement.querySelector(
        options.errorSelector
      );
      if (inputElement) {
        //Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          // Lấy ra đc value thông qua inputElement.value
          // Lấy đc test fuction qua rule.test
          validate(inputElement, rule);
        };

        //Xử lý mỗi khi người dùng nhập vào input
        inputElement.oninput = function (event) {
          errorElement.innerText = "";
          inputElement.parentElement.classList.remove("invalid");
        };
      }
    });
    // console.log(selectorRules);
  }
}

/**  Dinh nghia rules
 * 1. Khi có lỗi thì trả ra message lỗi
 * 2. Khi ko lỗi thì ko trả ra gì cả(undefined)
 */
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim()
        ? undefined
        : message || "Vui lòng nhập vào trường này!!!";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Định dạng email không chính xác!!!";
    },
  };
};

Validator.minLength = function (selector, minLength, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= minLength
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${minLength} ký tự!!!`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không trùng khớp !!!";
    },
  };
};
