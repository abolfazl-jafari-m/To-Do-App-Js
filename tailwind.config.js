/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js}',
        './public/**/*.{html,js}'],
    safelist : [
        'bg-[#2e7d32]',
        'bg-[#ffc107]',
        'bg-[#DC2626]',
    ],
    theme: {
        extend: {
          keyframes : {
            fadeIn : {
              '0%' : { opacity : 0},
              '50%' : { opacity : 0.5},
              '100%' :{opacity : 1}
            }
          } ,
          animation : {
            fadeIn : "fadeIn .5s ease-in",
            fadeOut : "fadeIn .5s ease-in reverse"
          }
        },
    },
    plugins: [],
}

