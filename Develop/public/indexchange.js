
let db;
// establish a connection to IndexedDB database 
const request = indexedDB.open('budget_tracker', 1);

// this event will
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function (event) {
  
    db = event.target.result;
    // check if app is online
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};


function saveRecord(record) {
    // open a new transaction with the database 
    const transaction = db.transaction(['new_transaction'], 'readwrite');

  
    const budgetObjectStore = transaction.objectStore('new_transaction');

  
    budgetObjectStore.add(record);
};

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // get all transactions from store and set to a variable
    const getAll = budgetObjectStore.getAll();

    // run this function
    getAll.onsuccess = function () {
     
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
        
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
            
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                
                    budgetObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}


window.addEventListener('online', uploadTransaction);