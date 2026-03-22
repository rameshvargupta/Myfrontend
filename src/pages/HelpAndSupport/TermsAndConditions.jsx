import React from "react";

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">

            {/* Container */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">

                {/* Heading */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                    Terms & Conditions
                </h1>

                {/* Intro */}
                <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
                    Welcome to <span className="font-semibold text-indigo-600">GTShop</span>.
                    By using our website, you agree to the following terms and conditions.
                    Please read them carefully before making any purchase.
                </p>

                {/* Shop Details */}
                <Section title="1. Shop Information">
                    <p><strong>Shop Name:</strong> GTShop</p>
                    <p><strong>Address:</strong> Jungal Gulariha</p>
                    <p><strong>Mobile Number:</strong> 7523062030</p>
                </Section>

                {/* Order Policy */}
                <Section title="2. Order Policy">
                    <p>
                        All orders placed on our platform are subject to availability
                        and confirmation. We reserve the right to cancel any order
                        due to stock issues or pricing errors.
                    </p>
                </Section>

                {/* Delivery Policy */}
                <Section title="3. Delivery Policy">
                    <p>
                        We provide <span className="font-semibold text-green-600">Open Box Delivery</span>
                        to ensure transparency and customer satisfaction.
                    </p>
                    <ul className="list-disc pl-5 mt-2 text-gray-600">
                        <li>You can check the product at the time of delivery.</li>
                        <li>If the product is damaged or incorrect, you can reject it immediately.</li>
                    </ul>
                </Section>

                {/* Return Policy */}
                <Section title="4. Return Policy">
                    <p className="text-red-500 font-medium">
                        Currently, we do NOT offer return or replacement after delivery.
                    </p>
                    <p className="mt-2 text-gray-600">
                        Customers are advised to verify the product during Open Box Delivery.
                        Once accepted, no return or refund will be applicable.
                    </p>
                </Section>

                {/* Payment */}
                <Section title="5. Payment Terms">
                    <p>
                        We accept secure payment methods. All transactions are processed
                        safely, and customer data is protected.
                    </p>
                </Section>

                {/* Changes */}
                <Section title="6. Changes to Terms">
                    <p>
                        GTShop reserves the right to update these terms at any time
                        without prior notice.
                    </p>
                </Section>

                {/* Contact */}
                <Section title="7. Contact Us">
                    <p>If you have any questions, feel free to contact us:</p>
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

export default TermsAndConditions;