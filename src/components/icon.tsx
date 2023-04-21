import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faGithub,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

const ICON_MAP = {
  twitter: faTwitter,
  github: faGithub,
  instagram: faInstagram,
  ellipsis: faEllipsisH,
};

export type IconProps = {
  icon: keyof typeof ICON_MAP;
  size?: SizeProp;
};

export default function Icon(props: IconProps) {
  return <FontAwesomeIcon icon={ICON_MAP[props.icon]} size={props.size} />;
}
