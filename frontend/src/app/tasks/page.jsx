import { Header } from "@/components/header"
const Task = () => {
    return (
        /*  活動卡片區  */
        <>
            <Header />
            <section className="container my-5">
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">基隆百年墓園導覽</h5>
                                <p className="card-text">穿越迷霧走入歷史最陰處，體驗地獄之門的真實存在。</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">信義區都市傳說任務</h5>
                                <p className="card-text">跟著鬼影留下的線索，揭開真相或失蹤的祕密。</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">台南禁地鬼屋闖關</h5>
                                <p className="card-text">一棟被詛咒的古宅，妳敢走完每一層樓嗎？</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">辛亥隧道長髮女子</h5>
                                <p className="card-text">隧道深處傳來拖曳長髮的沙沙聲，彷彿她正一步步貼近你的車窗。</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">八卦山崖邊紅衣少女</h5>
                                <p className="card-text">夜間獨行於山腰小徑，忽見一襲紅裙少女性影立於懸崖邊，呼喚聲細若耳語，轉身卻落空，事後才發現鞋印停在岩縫間，卻人影全無。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
export default Task;