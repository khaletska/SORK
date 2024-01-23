import {ReactElement,useState} from "react";

type Props = {
  children: ReactElement[];
}

const Tabs= ({ children }:Props) => {

    const [selectedTab, setSelectedTab] = useState(0)

  return (
    <div>
      <ul className="tabs">
        {children.map((child, index) => (
          <li key={index} className="tab-item">
            <button className={`header-20 tab-button ${selectedTab !== index && "inactive-tab-button"}`} onClick={() => setSelectedTab(index)}>{child.props.title}</button>
          </li>
        ))}
      </ul>
      {children[selectedTab]}
    </div>
  )
}

export default Tabs