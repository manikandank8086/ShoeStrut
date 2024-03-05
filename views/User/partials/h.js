    
   var quantityElement = document.getElementById(`quantityValue_${productId}`);
   function quantityDown(id){
     updateQuantity('decrement',`${id}`)
     
     console.log(id)
   }
 
   function quantityUp(id){
       
     const currentQuantity =  quantityElement.innerText;
     console.log(currentQuantity)
     // Fetch the current quantity from the backend
     fetch(`/product/getQuantity/${id}`)
         .then(response => response.json())
         .then(data => {
             const dbQuantity = data.quantity; // Assuming the response returns the quantity from the database
 
             if (currentQuantity < dbQuantity) {
                 updateQuantity('increment', `${id}`);
             } else {
                 // Show a message to the user indicating that the maximum quantity is reached
                 Swal.fire({
                     text: 'Maximum quantity reached.',
                     icon: 'warning',
                     confirmButtonText: 'OK',
                 });
             }
         })
         .catch(error => {
             console.log('Fetch Error:', error);
         });
   }
 
   function updateQuantity(action, productId) {
     const currentQuantity = parseInt(quantityElement.innerText);
     
 
     fetch(`/product/updateQuantity/${productId}`, {  
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({
             action: action,
             currentQuantity: currentQuantity,
         }),
     })
         .then(response => response.json())
         .then(data => {
             console.log("product quantity" ,data.quantity)
             // document.getElementById(`quantityValue_${productId}`).innerText = data.quantity
 
           if(data.status==="exceeded"){
             Swal.fire({
     
         text: 'Are you sure  you want to remove this item?',
         icon: 'warning',
 
         confirmButtonText: 'OK',
     
     })
           }
     const matchedProductData = data.matchedProduct;
 
     const productData = data.product;
 
     console.log("Matched Product:", matchedProductData);
     console.log("Product:", productData);
 
     quantityElement.innerText = matchedProductData.quantity;
     document.getElementById(`${matchedProductData._id}`).innerText = matchedProductData.total;
     document.getElementById('cartDataTotal').innerHTML = productData.total;
 })
         .catch(error => {
             console.log('Fetch Error:', error);       
         });
 }
 
 
 
 