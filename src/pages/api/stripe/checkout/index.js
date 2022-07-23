import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

const createCheckoutSession = async (req, res) => {
  if (req.method === 'POST') {
    const { quantity = 1, metadata = {}, priceId } = req.body;
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // billing_address_collection: 'required',

        line_items: [
          {
            price: priceId,
            quantity,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          trial_from_plan: true,
          metadata,
        },
        success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/subscription`,
      });

      return res.status(200).json({ sessionId: session.id });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
};

export default createCheckoutSession;
