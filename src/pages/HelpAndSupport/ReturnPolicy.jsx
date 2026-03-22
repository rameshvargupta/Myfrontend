import React from "react";

const ReturnPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">

            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">

                {/* Heading */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                    Return & Refund Policy
                </h1>

                {/* Intro */}
                <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
                    At <span className="font-semibold text-indigo-600">GTShop</span>, 
                    we aim to provide high-quality products and a transparent shopping experience.
                    Please read our return policy carefully before placing an order.
                </p>

                {/* Open Box Delivery */}
                <Section title="1. Open Box Delivery">
                    <p>
                        We provide <span className="font-semibold text-green-600">Open Box Delivery</span> 
                        for all eligible orders.
                    </p>

                    <ul className="list-disc pl-5 mt-2 text-gray-600">
                        <li>You can open and check the product at the time of delivery.</li>
                        <li>Verify product condition, quality, and correctness.</li>
                        <li>If the product is damaged or incorrect, you can reject it immediately.</li>
                    </ul>
                </Section>

                {/* No Return */}
                <Section title="2. No Return Policy">
                    <p className="text-red-500 font-semibold">
                        We do NOT accept returns or replacements after successful delivery.
                    </p>

                    <p className="mt-2 text-gray-600">
                        Once the product is accepted during delivery, it will be considered final 
                        and no return, refund, or exchange request will be entertained.
                    </p>
                </Section>

                {/* Customer Responsibility */}
                <Section title="3. Customer Responsibility">
                    <ul className="list-disc pl-5 text-gray-600">
                        <li>Customer must check the product during delivery.</li>
                        <li>Do not accept the product if it is damaged or incorrect.</li>
                        <li>After accepting delivery, the responsibility transfers to the customer.</li>
                    </ul>
                </Section>

                {/* Exceptions */}
                <Section title="4. Exceptions (If Applicable)">
                    <p className="text-gray-600">
                        In rare cases, if there is a proven issue from our side, 
                        GTShop may review the request and take appropriate action.
                        However, this is not guaranteed.
                    </p>
                </Section>

                {/* Contact */}
                <Section title="5. Need Help?">
                    <p>If you have any concerns, contact us:</p>
                    <p className="mt-2"><strong>Phone:</strong> 7523062030</p>
                    <p><strong>Address:</strong> Jungal Gulariha</p>
                </Section>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} GTShop. All rights reserved.
                </div>

            </div>
        </div>
    );
};

/* Reusable Section */
const Section = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
            {title}
        </h2>
        <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-1">
            {children}
        </div>
    </div>
);

export default ReturnPolicy;