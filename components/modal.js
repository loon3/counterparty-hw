

export default function ModalTemplate(props) {
//    
//                        <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 bg-black rounded-t">
//                      <h3 className="text-md sm:text-2xl font-semibold text-white">
//                        {props.title}
//                      </h3>
//                      
//                    </div>
        
   return (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-full my-6 mx-2 max-w-xl">
                  {/*content*/}
                  <div className="border-r-8 border-b-8 border-l-8 border-t-8 border-gray-200 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none pt-4">
                    {/*header*/}

                    <div className="relative px-6 pb-6 pt-3 flex-auto">
        
                        {props.children}
                    </div>
                    
                  </div>
                </div>
              </div>
              <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
            </>
  )
}