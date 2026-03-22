import React from "react";

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">

            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                    Refund Policy
                </h1>

                <p className="text-gray-600 mb-6">
                    At <span className="font-semibold text-indigo-600">GTShop</span>, 
                    we follow a strict no-refund policy after delivery.
                </p>

                <Section title="1. No Refund After Delivery">
                    <p className="text-red-500 font-semibold">
                        Once the product is delivered and accepted, no refund will be issued.
                    </p>
                </Section>

                <Section title="2. Open Box Delivery Advantage">
                    <ul className="list-disc pl-5 text-gray-600">
                        <li>Customers can check the product at delivery time.</li>
                        <li>If damaged or incorrect, reject immediately.</li>
                        <li>No refund once accepted.</li>
                    </ul>
                </Section>

                <Section title="3. Payment Refund (If Applicable)">
                    <p>
                        If an order is cancelled before dispatch, the refund will be 
                        processed within 5-7 business days.
                    </p>
                </Section>

                <Section title="4. Exceptions">
                    <p>
                        In rare cases, if there is a serious issue from our side, 
                        we may review and decide accordingly.
                    </p>
                </Section>

                <Section title="5. Contact">
                    <p><strong>Phone:</strong> 7523062030</p>
                    <p><strong>Address:</strong> Jungal Gulariha</p>
                </Section>

                <div className="mt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} GTShop
                </div>

            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="text-gray-600 text-sm space-y-1">{children}</div>
    </div>
);

export default RefundPolicy;