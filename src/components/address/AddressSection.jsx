import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setAddresses, selectAddress } from "@/redux/addressSlice";
import { fetchAddresses, saveAddress, deleteAddress } from "@/api/addressApi";

const AddressSection = () => {

  const dispatch = useDispatch();

  const { addresses, selectedAddress } = useSelector(
    (state) => state.address
  );

  const [editId, setEditId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  const addressToShow = showAllAddresses
    ? addresses
    : selectedAddress
      ? [selectedAddress]
      : [];

  useEffect(() => {

    const loadAddresses = async () => {

      const data = await fetchAddresses();

      if (!data.success) return;

      dispatch(setAddresses(data.addresses));

      if (data.addresses.length === 0) {
        dispatch(selectAddress(null));
        return;
      }

      const backendDefault =
        data.addresses.find(a => a.isDefault) ||
        data.addresses[0];

      dispatch(selectAddress(backendDefault));
    };

    loadAddresses();

  }, []);

  const handleAddressChange = (e) => {

    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value
    });

  };

  const resetForm = () => {

    setEditId(null);
    setShowAddressForm(false);

    setAddressForm({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      state: "",
    });

  };

  const handleSaveAddress = async () => {

    const { fullName, phone, address, city, pincode, state } = addressForm;

    if (!fullName || !phone || !address || !city || !pincode || !state) {

      toast.error("Please fill all address fields");
      return;

    }

    try {

      const data = await saveAddress(addressForm, editId);

      if (!data.success) {

        toast.error(data.message || "Address save failed");
        return;

      }

      dispatch(setAddresses(data.addresses));

      if (editId) {

        const updated = data.addresses.find(a => a._id === editId);
        dispatch(selectAddress(updated));

        toast.success("Address updated successfully");

      } else {

        const backendDefault =
          data.addresses.find(a => a.isDefault) ||
          data.addresses[0];

        dispatch(selectAddress(backendDefault));

        toast.success("Address added successfully");

      }

      resetForm();

    } catch (err) {

      console.error("SAVE ADDRESS ERROR", err);
      toast.error("Something went wrong");

    }

  };

  const handleEditAddress = (addr) => {

    setEditId(addr._id);

    setAddressForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    });

    setShowAddressForm(true);

  };

  const handleDeleteAddress = async (id) => {

    if (!window.confirm("Delete this address?")) return;

    const data = await deleteAddress(id);

    if (!data.success) {

      toast.error(data.message);
      return;

    }

    dispatch(setAddresses(data.addresses));

    if (selectedAddress?._id === id) {

      const backendDefault =
        data.addresses.find(a => a.isDefault) ||
        data.addresses[0];

      dispatch(selectAddress(backendDefault));

    }

    toast.success("Address deleted");

  };

  return (

    <div className="bg-white p-6 rounded-lg shadow">

      <div className="flex justify-between mb-4">

        <h2 className="text-lg font-semibold">
          Shipping Address
        </h2>

        <div className="flex gap-2">

          <Button onClick={() => setShowAddressForm(true)}>
            + Add Address
          </Button>

          {addresses.length > 1 && (

            <Button
              variant="outline"
              onClick={() => setShowAllAddresses(!showAllAddresses)}
            >
              {showAllAddresses ? "Done" : "Change Address"}
            </Button>

          )}

        </div>

      </div>

      {/* ADDRESS FORM */}

      {showAddressForm && (

        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">

          <input
            name="fullName"
            placeholder="Full Name"
            value={addressForm.fullName}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          />

          <input
            name="phone"
            placeholder="Phone"
            value={addressForm.phone}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          />

          <textarea
            name="address"
            placeholder="Address"
            value={addressForm.address}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          />

          <div className="grid grid-cols-3 gap-3">

            <input
              name="city"
              placeholder="City"
              value={addressForm.city}
              onChange={handleAddressChange}
              className="border p-2 rounded"
            />

            <input
              name="state"
              placeholder="State"
              value={addressForm.state}
              onChange={handleAddressChange}
              className="border p-2 rounded"
            />

            <input
              name="pincode"
              placeholder="Pincode"
              value={addressForm.pincode}
              onChange={handleAddressChange}
              className="border p-2 rounded"
            />

          </div>

          <div className="flex gap-2 justify-end">

            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>

            <Button onClick={handleSaveAddress}>
              {editId ? "Update" : "Save"}
            </Button>

          </div>

        </div>

      )}

      {/* ADDRESS LIST */}

      <div className="space-y-3 mt-4">

        {addressToShow.map((addr) => (

          <div
            key={addr._id}
            className={`border rounded-lg p-4 flex justify-between ${
              selectedAddress?._id === addr._id
                ? "border-green-600 bg-green-50"
                : ""
            }`}
          >

            <label className="flex gap-3 cursor-pointer">

              <input
                type="radio"
                checked={selectedAddress?._id === addr._id}
                onChange={() => dispatch(selectAddress(addr))}
              />

              <div>

                <p className="font-semibold">
                  {addr.fullName}
                </p>

                <p className="text-sm text-gray-600">
                  {addr.address}, {addr.city}
                </p>

                <p className="text-sm">
                  📞 {addr.phone}
                </p>

              </div>

            </label>

            {showAllAddresses && (

              <div className="flex gap-2">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditAddress(addr)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteAddress(addr._id)}
                >
                  Delete
                </Button>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );
};

export default AddressSection;