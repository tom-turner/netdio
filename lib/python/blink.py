import RPi.GPIO as GPIO    # Import Raspberry Pi GPIO library
from time import sleep     # Import the sleep function from the time module
GPIO.setwarnings(False)    # Ignore warning for now
GPIO.setmode(GPIO.BOARD)   # Use physical pin numbering
GPIO.setup(8, GPIO.OUT, initial=GPIO.LOW) 
pin = 8
t_end = time.time() + 10

while time.time() < t_end: # Run 10 seconds
    GPIO.output(pin, GPIO.HIGH) # Turn on
    sleep(0.25)                  # Sleep for 1 second
    GPIO.output(pin, GPIO.LOW)  # Turn off
    sleep(0.25)                  # Sleep for 1 second