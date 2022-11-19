@REM start cmd /k "npm i && npm start"
set /p token=Type in your ngrok authtoken or press CTRL+C to exit
echo ""
cd ./batches
start cmd /k "ngrok config add-authtoken %token%"
cd ../
exit