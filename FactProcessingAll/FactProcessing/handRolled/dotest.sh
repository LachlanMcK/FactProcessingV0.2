#! 
clear
echo 'Path is: ' $path ' and current directory is: ' 
pwd 

source ./.myProxyValues.sh

#export http_proxy=http://${http_proxy_user}:${http_proxy_pwd}@proxy.prod.atonet.gov.au:8080
#export https_proxy=https://${http_proxy_user}:${http_proxy_pwd}@proxy.prod.atonet.gov.au:8080

#powershell version
#rem curl -Body myForm.json  -Method PUT -Uri http://localhost:3000/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Forms/myFT6Form/1111111111

protocol=http://

hostName=ao3yqxfspi.execute-api.ap-southeast-2.amazonaws.com/prod
hostName=localhost:3000

idType=ABN
idVal=1234567890

#formType=myFT6Form
#tranId=1111111111

formType=10131Form
tranId=111222333
# tranId=5432101



if [ $1 == "getall" ] 
then
    echo 'doing ' $1 ' test'
    outputFile='./getall.json'
    echo curl -v ${protocol}${hostName}/api/v1/Clients/ALL/Forms > cmdFile.sh
fi

if [ $1 == "get" ] 
then
    echo 'doing ' $1 ' test'
    outputFile='./get1.json'
    echo curl -v ${protocol}${hostName}/api/v1/Clients/${idType}/${idVal}/Accounts/1/Roles/IT/Forms/${formType}/${tranId} > cmdFile.sh
fi

if [ $1 = 'getid' ]
then
    echo 'doing ' $1 ' test'
    outputFile="getid1.json"
    echo curl -v ${protocol}${hostName}/api/v1/Clients/${idType}/${idVal}/FormIdentity/${formType} > cmdFile.sh
fi

if [ $1 = 'put' ]
then
    echo 'doing ' $1 ' test'
    inputFile="STPData.json"
    outputFile="put1.json"
    touch ${outputFile}
    #echo curl -d @.\/myForm.json -H '"Content-Type: application/json"' -X PUT ${protocol}${hostName}/api/v1/Clients/${idType}/${idVal}/Accounts/1/Roles/IT/Forms/${formType}/${tranId} > cmdFile.sh
    #echo curl -d @..\/tests\/putTestData.json -H '"Content-Type: application/json"' -X PUT ${protocol}${hostName}/api/v1/Clients/${idType}/${idVal}/Accounts/1/Roles/IT/Forms/${formType}/${tranId} > cmdFile.sh
    echo curl -d @..\/tests\/${inputFile} -H '"Content-Type: application/json"' -X PUT ${protocol}${hostName}/api/v1/Clients/${idType}/${idVal}/Accounts/1/Roles/IT/Payrolls/${formType}/${tranId} > cmdFile.sh
fi

if [ $1 = 'putid' ]
then
    echo 'doing ' $1 ' test'
    outputFile="putid1.json"
    cat ..\/tests\/putIdMatchData.json
    echo curl -d @..\/tests\/putIdMatchData.json  -H '"Content-Type: application/json"' -X PUT ${protocol}${hostName}/api/v1/Clients/${idType}/${idVal}/FormIdentity/${formType} > cmdFile.sh
fi


if [ $1 = 'delete' ]
then
    echo 'doing ' $1 ' test'
    outputFile="delete.json"
    echo curl -X DELETE ${protocol}${hostName}/api/v1/Clients/${idType}/${idVal}/Forms/${formType}/${tranId} > cmdFile.sh
fi

if [ $1 = 'veryveryold' ]
then
    curl -d '{"formType":"myFT1", "betNumber":"112233", "sections": "{blah}"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:3000/forms -o post2.json
fi

echo "about to run..."
cat cmdFile.sh
./cmdFile.sh  > ${outputFile}

echo "result..."
cat ${outputFile}

if [ $1 = 'keep' ]
then 
    cat ${outputFile}
else
    rm ${outputFile}
    rm cmdFile.sh
fi
