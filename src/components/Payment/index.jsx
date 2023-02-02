// import { useRef } from 'react';
// import { db } from '_firebase';
// import { CardElement, Elements } from '@stripe/react-stripe-js';
// import { Timestamp} from '@firebase/firestore';
// import {loadStripe} from '@stripe/stripe-js';

// export const PaymentPage = async () => {
//   const stripe = await loadStripe('pk_test_51MTrP1LXVWOpsOMZjRJHPPmosm0kMZiKPy0PTgby4iavolcYFWMZAu8v2txFP93gRsNaSsa0iIkmKG6KohnyrQn600S720q3TC');
//   const cardElement = useRef(null);
//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const {error, paymentMethod} = await stripe.createPaymentMethod({
//       type: 'card',
//       card: cardElement.current,
//     });
//     if (error) {
//       console.log(error);
//       return;
//     }
//     const {id} = paymentMethod;
//     const amount = 1; // hard-coded for demo purposes
//     const customer = await stripe.customers.create();
//     const charge = await stripe.charges.create({
//       amount,
//       currency: 'usd',
//       customer: customer.id,
//       source: id,
//     });

//     // Save the transaction in Firebase
//     await db.collection('transactions').add({
//       amount: charge.amount,
//       created: Timestamp.fromMillis(charge.created * 1000),
//     });
//   }
//   return (
//     <form onSubmit={handleSubmit}>
//       <Elements stripe={stripe}>
//         <CardElement ref={cardElement} />
//       </Elements>
//       <button type="submit">Pay</button>
//     </form>
//   );
// }

export const PaymentPage = () => {
  return (
    <div>
      <p>Payment Page</p>
    </div>
  )
}
