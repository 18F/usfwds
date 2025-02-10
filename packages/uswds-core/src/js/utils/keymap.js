/**
 * Callback to be called when key is pressed.
 *
 * @typedef {(event: KeyboardEvent) => any} KeyboardEventHandler
 */

/**
 * Object with keyboard key combination as object key, and corresponding callback handler as value.
 *
 * @typedef {Record<string, KeyboardEventHandler>} KeymapConfig
 */

/**
 * Initialize keyboard events with an object of keyboard key combinations and corresponding event
 * handlers.
 *
 * @param {KeymapConfig} map
 * @return {KeyboardEventHandler}
 */
module.exports = (map) => (event) =>
  Object.keys(map).forEach((combo) => {
    // Each key combination can have one or more modifier, where each modifier is prefixed with the
    // modifier name and "+".
    const parts = combo.split("+");

    // The keyboard key name should come as the last part of a "+" delimited key. Popping the item
    // will result in `parts` only containing the modifiers to be checked.
    const key = parts.pop();

    // Verify that the modifiers on the event are exactly equal to the modifiers specified in the
    // key combination.
    const isModifierMatch = ["Shift", "Alt", "Ctrl", "Meta"]
      // For any modifier active in the event (or vice-versa, expected in the key combination)...
      .filter((mod) => event.getModifierState(mod) || parts.includes(mod))
      // Ensure that it is expected in the key combination (or vice-versa, active in the event).
      .every((mod) => event.getModifierState(mod) && parts.includes(mod));

    if (key === event.key && isModifierMatch) {
      map[combo](event);
    }
  });
