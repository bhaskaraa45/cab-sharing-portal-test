import React, { useEffect, useState } from "react";
import axios from "axios";
import { matchIsValidTel } from "mui-tel-input";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneNumberModal from "components/modals/PhoneNumberModal";
import UserTravellers from "components/rootUserSpecific/UserTravellers";
import toastError from "components/utils/toastError";
import logout from "components/utils/logout";

const AllUserCardExpanded = ({
  bookingData,
  email,
  fetchFilteredBookings,
  loaded_phone,
  phone,
  setPhone,
  is_there_a_phone_number,
  setIsThereAPhoneNumber,
  setLoadedPhone,
}) => {
  const [isValidToJoin, setIsValidToJoin] = useState(false);
  const [joinComment, setJoinComment] = useState("I am interested to join.");
  const [phoneIsValid, setPhoneIsValid] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  const [clicked_join, setClickedJoin] = useState(false);

  const JoinBooking = async () => {
    setClickedJoin(true);

    if (phone !== loaded_phone) {
      try {
        const res = await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL_BASE}/user/update`,
          JSON.stringify({
            phone_number: phone,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        toast("Phone Number Updated", { type: "success" });
        setLoadedPhone(phone);
        setIsThereAPhoneNumber(true);
      } catch (err) {
        console.log(err);
        toastError(err.response.data.detail);
        if (err.response.status === 401) {
          await logout(router);
          return;
        }
        toast("Phone Number Update Failed", { type: "error" });
      }
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/${bookingData.id}/request`,
        { comments: joinComment },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Successfully requested the user booking");
      toast("Successfully requested the user booking", { type: "success" });
    } catch (err) {
      console.log(err);
      toastError(err.response.data.detail);
      if (err.response.status === 401) {
        await logout(router);
        return;
      }
      toast("Cannot join booking", { type: "error" });
    } finally {
      setClickedJoin(false);
      fetchFilteredBookings();
    }
  };

  // const handlePhoneEdit = async () => {
  //   if (phone != loaded_phone) {
  //     await axios
  //       .post(
  //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
  //         JSON.stringify({
  //           phone_number: phone,
  //         }),
  //         {
  //           headers: {
  //             Authorization: authToken,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       )
  //       .then((res) => {
  //         setIsThereAPhoneNumber(true);
  //         toast("Phone Number Updated", { type: "success" });
  //         fetchFilteredBookings();
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //     setIsThereAPhoneNumber(true);
  //   }
  // };

  const handleCancelRequest = async (e) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/${bookingData?.id}/request`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast("Succesfully Cancelled Request", { type: "success" });
      fetchFilteredBookings();
    } catch (err) {
      console.log(err);
      toastError(err.response.data.detail);
      if (err.response.status === 401) {
        await logout(router);
        return;
      }
      toast("Something went wrong", { type: "error" });
    }
  };

  const travellers_email_list = [];
  bookingData.travellers.map((item) => travellers_email_list.push(item.email));

  const request_email_list = [];
  bookingData.requests?.map((item) => request_email_list.push(item.email));

  const isInRequest = request_email_list.indexOf(email);
  let ownerIndex = 0;

  const handlePhoneChange = (value, info) => {
    setPhone(info.numberValue);
    setPhoneIsValid(matchIsValidTel(info.numberValue));
  };

  useEffect(() => {
    if (travellers_email_list.indexOf(email) === -1 && isInRequest === -1) {
      setIsValidToJoin(true);
    } else {
      ownerIndex = travellers_email_list.indexOf(email);
    }
  }, []);

  return (
    <div onClick={(e) => e.stopPropagation()} className="mt-5 w-full">
      <div className="flex flex-row gap-3 my-5 justify-between ">
        <div className="break-words text-[.8rem] sm:text-[.9rem]">
          <span className="text-secondary text-[.9rem] md:text-[1rem]">
            Note:
          </span>{" "}
          {bookingData.travellers[0].comments}
        </div>
        {isValidToJoin && isInRequest === -1 && (
          <button
            className="py-1 px-2 h-8 sm:h-10 my-auto sm:p-2 rounded-md text-[.8rem] sm:text-[1rem] bg-secondary/70 border border-black hover:bg-secondary/70 hover:text-white ease-in-out delay-150 hover:border-black text-white"
            onClick={() => setIsModalVisible(true)}
          >
            Join
          </button>
        )}
        {isInRequest !== -1 && (
          <button
            onClick={(e) => {
              handleCancelRequest(e);
            }}
            className="p-1 sm:p-2 rounded-md text-[.8rem] sm:text-[1rem] bg-transparent border border-black hover:bg-secondary/70 hover:text-white ease-in-out delay-150 hover:border-black text-black/80"
          >
            Cancel Request
          </button>
        )}
      </div>
      <div className="mt-5 px-2">
        {bookingData.travellers.length > 0 && (
          <UserTravellers
            travellers={bookingData.travellers}
            hidePhoneNumber={true}
            owner_email={bookingData.owner_email}
          />
        )}
      </div>
      {isModalVisible ? (
        !is_there_a_phone_number ? (
          <dialog
            id="my_modal_3"
            className="modal modal-open "
            onClick={(e) => e.stopPropagation()}
          >
            <form method="dialog" className="modal-box bg-white text-black pb-[6.5rem]">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 "
                onClick={() => setIsModalVisible(false)}
              >
                ✕
              </button>
              <h3 className="font-bold text-lg text-secondary/80 w-fit mb-5">
                Add phone number to join/create ride.
              </h3>
              <PhoneNumberModal
                handlePhoneChange={handlePhoneChange}
                phone={phone}
                loaded_phone={loaded_phone}
                setPhone={setPhone}
                phoneIsValid={phoneIsValid}
                setIsThereAPhoneNumber={setIsThereAPhoneNumber}
              />
            </form>
          </dialog>
        ) : (
          <dialog
            id="my_modal_3"
            className="modal modal-open"
            onClick={(e) => e.stopPropagation()}
          >
            <form method="dialog" className="modal-box bg-white text-black">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setIsModalVisible(false)}
              >
                ✕
              </button>
              {isValidToJoin && isInRequest === -1 ? (
                <div className="flex flex-col gap-5">
                  <p>Add a Comment ( max 250 characters )</p>
                  <textarea
                    maxLength={250}
                    disabled={!isValidToJoin && !is_there_a_phone_number}
                    onClick={(e) => e.stopPropagation()}
                    value={joinComment}
                    name="comment"
                    onChange={(e) => setJoinComment(e.target.value)}
                    className="bg-transparent w-[80%] txt-black text-[.8rem] sm:text-[1.1rem] py-3 pl-2 rounded-md border border-gray-100 shadow-md"
                  />
                  <div className="flex gap-5 justify-end">
                    <button
                      className="w-fit flex btn bg-secondary/70 text-white/80 hover:bg-secondary/80 disabled:bg-gray-200 disabled:text-gray-300"
                      onClick={() => {
                        setIsModalVisible(false);
                        setJoinComment("I am interested to join.");
                      }}
                    >
                      Close
                    </button>
                    <button
                      className="w-fit flex btn bg-secondary/70 text-white/80 hover:bg-secondary/80 disabled:bg-gray-200 disabled:text-gray-300"
                      onClick={JoinBooking}
                      disabled={
                        joinComment.length === 0 ||
                        phone.replace("+91", "") === "" ||
                        clicked_join
                      }
                    >
                      {phone.replace("+91", "") === "" ? (
                        "Add Phone Number"
                      ) : clicked_join ? (
                        <span className="loading loading-spinner text-black"></span>
                      ) : (
                        "Join"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p></p>
              )}
            </form>
          </dialog>
        )
      ) : null}
    </div>
  );
};

export default AllUserCardExpanded;

