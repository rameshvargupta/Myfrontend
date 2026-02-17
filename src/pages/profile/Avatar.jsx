const Avatar = ({ user, size = "w-12 h-8", className = "" }) => {
  const hasImage = user?.profilePic;

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName[0].toUpperCase() : "";
    const last = lastName ? lastName[0].toUpperCase() : "";
    return first + last;
  };

  return (
    <div className={`${size} ${className}`}>
      {hasImage ? (
        <img
          src={user.profilePic}
          alt="User"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
          {getInitials(user?.firstName, user?.lastName)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
