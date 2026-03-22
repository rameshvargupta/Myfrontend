import React from "react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">

            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-10">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                    Privacy Policy
                </h1>

                <p className="text-gray-600 mb-6">
                    At <span className="font-semibold text-indigo-600">GTShop</span>, 
                    we value your privacy and are committed to protecting your personal information.
                </p>

                <Section title="1. Information We Collect">
                    <ul className="list-disc pl-5 text-gray-600">
                        <li>Name, email, and phone number</li>
                        <li>Shipping and billing address</li>
                        <li>Order and transaction details</li>
                    </ul>
                </Section>

                <Section title="2. How We Use Your Information">
                    <ul className="list-disc pl-5 text-gray-600">
                        <li>To process and deliver orders</li>
                        <li>To improve our services</li>
                        <li>To contact you regarding your orders</li>
                    </ul>
                </Section>

                <Section title="3. Data Protection">
                    <p>
                        We implement secure systems to protect your data. Your personal 
                        information is not sold or shared with third parties.
                    </p>
                </Section>

                <Section title="4. Cookies">
                    <p>
                        Our website may use cookies to enhance user experience 
                        and improve performance.
                    </p>
                </Section>

                <Section title="5. Your Rights">
                    <p>
                        You have the right to access, update, or delete your personal data 
                        by contacting us.
                    </p>
                </Section>

                <Section title="6. Contact Us">
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

export default PrivacyPolicy;