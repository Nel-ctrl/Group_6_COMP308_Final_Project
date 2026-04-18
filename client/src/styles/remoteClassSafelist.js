// Tailwind's content scanner does not reliably pick up classes from the
// federated remote source folders (../remote-*/src) when run from the host
// config. Listing those classes here keeps them in the production CSS.
// If a remote uses a class not listed here and it renders unstyled, add it.
export default String.raw`
  min-h-[calc(100vh-4rem)] min-h-screen
  max-w-7xl max-w-3xl max-w-2xl max-w-md mx-auto
  w-full w-12 flex-1 h-16 h-12 h-full
  px-8 px-6 px-5 px-4 px-3 px-2 py-12 py-10 py-8 py-6 py-3 py-2 py-1.5 py-0.5
  p-8 p-6 p-5 p-4 p-3 p-2
  mt-12 mt-10 mt-8 mt-4 mt-3 mt-2 mt-1
  mb-12 mb-8 mb-6 mb-4 mb-3 mb-2 mb-1
  pt-6 pt-4 pt-3
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 lg:grid-cols-4 lg:col-span-3 lg:col-span-1
  flex hidden md:flex flex-wrap items-center items-start justify-center justify-between
  gap-6 gap-4 gap-1 space-x-6 space-x-4 space-x-3 space-x-2 space-y-4 space-y-2 space-y-1
  overflow-x-auto whitespace-nowrap line-clamp-2
  block text-center text-5xl text-3xl text-2xl text-xl text-lg text-sm text-xs
  font-bold font-semibold font-medium
  bg-white bg-gray-50 bg-gray-100 bg-red-50 bg-red-100 bg-green-50 bg-green-100
  bg-blue-50 bg-blue-100 bg-blue-500 bg-blue-600 bg-green-500
  bg-purple-100 bg-purple-500 bg-orange-500
  bg-yellow-100 bg-primary-50 bg-primary-100 bg-primary-500 bg-primary-600 bg-primary-700
  text-white text-gray-900 text-gray-800 text-gray-700 text-gray-600 text-gray-500 text-gray-400
  text-red-700 text-red-600 text-red-500 text-green-700 text-green-600 text-yellow-700 text-yellow-600
  text-blue-800 text-blue-700 text-purple-700 text-primary-700 text-primary-600 text-primary-200
  border border-t border-l-4 border-gray-300 border-red-200 border-blue-400 border-primary-600
  rounded rounded-md rounded-lg rounded-full
  shadow shadow-md shadow-lg hover:shadow-md hover:shadow-lg
  transition outline-none underline hover:underline
  hover:bg-gray-200 hover:bg-blue-700 hover:bg-primary-50 hover:bg-primary-400 hover:bg-primary-700
  hover:text-primary-200 hover:text-primary-600
  group group-hover:text-primary-600
  focus:ring-2 focus:ring-primary-500 focus:border-transparent
  disabled:opacity-50 disabled:cursor-not-allowed
`;
