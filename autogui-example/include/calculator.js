// encapsulation closure
export function createCalculator() {
  let current_number = "";
  let previous_number = "";
  let operation = null;
  let reset = false;
  let last_operation = null;
  let last_user_input = "";

  function calculate(is_recursive) {
    let result;

    const current = parseFloat(current_number);
    const previous = parseFloat(previous_number);

    switch (operation) {
      case "+":
        result = previous + current;
        break;
      case "-":
        result = previous - current;
        break;
      case "x":
        result = previous * current;
        break;
      case "/":
        result = previous / current;
        break;
    }

    result = Math.round(result * 1000) / 1000;

    if (isNaN(result)) {
      current_number = "Error";
    } else {
      current_number = result.toString();

      if (last_operation && is_recursive) {
        previous_number = current_number;
        operation = last_operation; 
        calculate(false);
      } else if (!is_recursive) { 
        previous_number = current_number; 
        last_operation = operation;
      }
    }

    if (!is_recursive) {
      reset = true; 
    }
  }

  function onBtn(id, text_widget, sound_player) {
    sound_player.play();

    if (reset && !isNaN(id)) {
      current_number = "";
      previous_number = "";
      operation = null;
      reset = false;
    }

    if (["+", "-", "x", "/"].includes(id)) {
      if (reset) {
        previous_number = current_number;
        current_number = "";
        operation = id;
        reset = false;
      } else {
        previous_number = current_number;
        current_number = "";
        operation = id;
      }
      text_widget.update({ text: previous_number + " " + operation });
    } else if (id === "=") {
      if (operation) {
        last_user_input = current_number;
        calculate(true);
        reset = true;
      }
    } else if (id === "<") {
      current_number = current_number.slice(0, -1);
    } else if (id === "C") {
      current_number = "";
      previous_number = "";
      operation = null;
      text_widget.update({ text: "0" });
    } else {
      if (
        current_number === "Error" ||
        current_number === "0" ||
        parseFloat(current_number) === parseFloat(previous_number)
      ) {
        current_number = id;
        last_user_input = id;
      } else {
        current_number += id;
        last_user_input = id;
      }
    }

    if (id !== "C" && !["+", "-", "x", "/"].includes(id)) {
      text_widget.update({ text: current_number });
    }

    return current_number; // <- updated number
  }

  return onBtn; // <- onBtn function
}
