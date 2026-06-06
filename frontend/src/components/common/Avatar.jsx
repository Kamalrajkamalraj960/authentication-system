/** User avatar — shows the profile picture or initials fallback. */
const Avatar = ({ user, size = 'h-9 w-9' }) => {
  const initials = (user?.name || '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user.name}
        referrerPolicy="no-referrer"
        className={`${size} rounded-full object-cover ring-2 ring-white dark:ring-gray-800`}
      />
    );
  }

  return (
    <div
      className={`${size} flex items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
