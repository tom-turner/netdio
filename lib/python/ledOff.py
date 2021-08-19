import RPi.GPIO as GPIO    # Import Raspberry Pi GPIO library    # Import the sleep function from the time module
GPIO.setwarnings(False)    # Ignore warning for now
GPIO.setmode(GPIO.BOARD)   # Use physical pin numbering
GPIO.setup(8, GPIO.OUT, initial=GPIO.HIGH) 
pin = 8

GPIO.output(pin, GPIO.LOW) # Turn off