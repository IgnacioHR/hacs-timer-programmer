# HACS Timer Programmer

WORK-IN-PROGRESS

This is the UI for a timer programmer that allows to specify ON/OFF status for period of 24 hours divided in steps of 30 mintes. See the screen capture:

![Timer Programmer screen capture](images/timer-programmer.png?raw=true)

The rectangles in black indicates ON status and the absence of black rectangle indicates OFF status

The control in an editor of a numeric value (integer) that, internally, in converted to a bitmap. bit 0 is assigned to the 23:30 - 00:00 time range in the programmer and bit 47 is assigned to 00:00 - 00:30 time range.

## Remarks

The idea of this control comes from my Boiler, DeDietrich C-230-ECO, I want to develop a UI to be able to use it in Home Assistant.

## Credits

- This card project configuration was inspired on work from [pmongloid/flipdown-timer-card](https://github.com/pmongloid/flipdown-timer-card) and [@iantrich](https://github.com/iantrich)
