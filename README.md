# AutoGUI
AutoGUI is a simple and easy-to-use library for creating graphical user interfaces (GUIs) with auto-positioning for ZeppOS. It superseeds the official Widgets approach and provides a set of classes for creating various types of widgets, such as text, buttons, images, circles, arcs, filled rectangles, and stroked rectangles. AutoGUI also supports event handling for widgets, allowing you to attach event listeners for 'click up' and 'click down' events.

## Installation
Clone the repository or install with npm (later).

## Usage
Here's a basic example of how to use AutoGUI:

```javascript
const gui = new AutoGUI();

// add a text widget
const my_text = gui.text("Hello, world!");

// split the line
gui.newLine();

// add a button widget with a click event
gui.button("Click me!", () => { 
    // update the text widget on button click
    my_text.update({ text: "Button clicked!" }); 
});

// Finally render the GUI
gui.render();
```

For more detailed examples and usage instructions, please see/download the `autogui-examples`.

#### TextWidget, ButtonWidget, ImageWidget, CircleWidget, ArcWidget, FillRectWidget, StrokeRectWidget
These classes inherit from the Widget class and represent specific types of widgets. They each have their own render() method which renders the widget on screen.

### AutoGUI
The main class for creating GUIs.

### constructor()
Creates a new GUI system.

### lineLayout(...percentages)
Sets layout percentages for each line in GUI system.

### removeWidget(widget)
Removes a specific widget from GUI system.

### newLine()
Adds a new line in GUI system.

### text(text)
Adds a text element in GUI system.

### spacer()
Adds a spacer in GUI system.

### button(text, click_func)
Adds a button in GUI system.

### image(src)
Adds an image in GUI system.

### circle(color)
Adds a circle in GUI system.

### arc(end_angle, use_original_coordinates)
Adds an arc in GUI system.

### fillRect(color)
Adds a filled rectangle in GUI system.

### strokeRect(color)
Adds a stroked rectangle in GUI system.

### render()
Renders all widgets on screen.