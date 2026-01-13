import React from 'react'
import { Button } from './ui/button'

const Hero = () => {
    return (
        <section className='bg-gradient-to-r from-blue-600 to-purple-600 text-white py-40'>

            <div className='max-w-7xl mx-auto px-4'>

                <div className='grid-md:grid-cols-2 gap-8 items-center '>

                    <div>
                        <h1 className='text-4xl md:text-6xl font-bold mb-4'>
                            Latest Electronics at Best Rate and Good Quality
                        </h1>
                        <p className='text-xl mb-6 text-blue-100'>
                            Discover Cutting edge technology with deals on smartphone ,laptaop and more
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <Button variant='outline' className="border-white text-blue bg-blue-600 hover:text-blue-600 "> Shop now</Button>
                            <Button className="border-white text-blue-600 hover:bg-gray-100"> Shop now</Button>

                        </div>
                    </div>
                    <div className='relative'>
                        {/* image section here */}
                    </div>
                </div>
            </div>
        </section>

    )
}

export default Hero