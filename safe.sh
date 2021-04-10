echo "DIR is $DIR"
export FIREBASE="$DIR/firebase.json"
mkdir $DIR
mv firebase.json $DIR
npm start
