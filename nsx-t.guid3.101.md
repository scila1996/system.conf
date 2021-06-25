# Khái niệm và thuật ngữ cơ bản

## East-West traffic và North-South traffic

Thuật ngữ sử dụng trong DataCenter, các SDN phát triển dựa vào hạ tầng DataCenter nên sẽ sử dụng các thuật ngữ này.

- `East-West`: Đây là traffic nằm bên trong DataCenter, ví dụ giữa server với server.
- `North-South`: Đây là traffic từ client đến server hoặc từ server ra ngoài Internet, bao gồm tất cả các kết nối từ DataCenter ra ngoài hoặc từ ngoài vào trong DataCenter.

## Kiến trúc mạng Leaf-Spine

![image](https://user-images.githubusercontent.com/17109300/123466380-788d8880-d619-11eb-8601-a10281e1a6da.png)

Leaf Switch cung cấp các kết nối tới các máy chủ, Firewall, Router hoặc các thiết bị cân bằng tải. Các Leaf switch được kết nối tới tất cả Spine tạo thành mô hình Full-mesh nhưng không kết nối với nhau (Leaf-Leaf) trừ khi sử dụng các công nghệ HA như vPC, Stackwise, IRF.

Spine Switch được sử dụng để kết nối với tất cả Leaf switch. Các Spine switch cũng không kết nối với các Spine switch khác để tạo thành mô hình có cùng bước nhảy giữa các máy chủ. Điều này mang lại độ trễ có thể dự đoán và băng thông cao giữa các máy chủ. Liên kết giữa Leaf và Spine có thể là liên kết Layer 2 hoặc Layer 3 sử dụng các giao thức định tuyến IGP.

## Thiết kế hạ tầng Network

Dựa theo tài liệu của VMware, VMware Validated Design

https://docs.vmware.com/en/VMware-Validated-Design/6.2/sddc-architecture-and-design-for-the-management-domain/GUID-C924E896-D9C4-47BF-91D5-DF72605EF63E.html

Tài liệu này mô tả về việc thiết kế hệ thống VMware sử dụng NSX-T. Mô tả tổng quan về kiến trúc ứng dụng mô hình ví dụ CAA (Core-Aggregation-Access), Leaf-Spine. Hướng dẫn mô tả kết nối, tạo và chuẩn bị các VLAN, Subnets ở phần Underlay.

Danh sách các chức năng cần thiết trong hạ tầng NSX-T. Tạo VLAN và từng Subnets tương ứng với từng chức năng

- `Management`
- `vSphere vMotion`
- `vSAN`
- `Host Overlay`
- `NFS`
- `Uplink01`
- `Uplink02`
- ~~`Edge Overlay`~~

## Không gian địa chỉ mạng dành riêng (Reserved IP addresses)

Là các dải mạng đặc biệt và không được định tuyến trên Internet, danh sách theo trang chủ của IANA ở đây.

https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml

## Dải mạng 100.64.0.0/10

Trong năm 2012, IANA đã phân bổ 4 triệu địa chỉ 100.64.0.0/10 để sử dụng trong môi trường NAT với vai trò nhà cung cấp dịch vụ.

###### Carrier-grade NAT (CGNAT)

Công nghệ NAT được sử dụng trong ISP

Là dải địa chỉ mạng private giống như RFC1918 nhưng được dành riêng cho việc NAT giữa các nhà cung cấp Internet. Trên Internet, việc NAT không giống như ở dưới hạ tầng local, ISP không sử dụng các dải mạng Private RFC1918. họ dùng dải mạng dành riêng chỉ cho việc NAT giữa các thiết bị NAT, các thiết bị này phải hỗ trợ CGN. Dải mạng này không được quảng bá hoặc route ra ngoài Internet và cũng không dùng được trong Internal, nó chỉ dùng cho việc NAT giữa các Router trong và ngoài mạng

Dải địa chỉ này sẽ được ngầm sử dụng trong việc giao tiếp giữa Gateway TIER-0 và TIER-1 trong NSX-T

## Dải mạng 224.0.0.0/4

Đây là dải mạng Multicast, sử dụng nhiều trong giao thức VRRP, cấu hình định tuyến OSPF hoặc IGMP

## Dải mạng 169.254.0.0/16

Dải mạng link-local phiên bản cho IPv4. Phía dưới nền network, địa chỉ này có thể được sử dụng để cung cấp các dịch vụ như Time, DNS Server. Ví dụ như AWS EC2 sử dụng các địa chỉ sau

- `NTP`: *169.254.169.123*
- `DNS`: *169.254.169.253*

## Routing Architecture

Trong NSX-T có 2 loại Gateway là Tier-0 (north-south traffic) và Tier-1 (east-west traffic).

Dựa vào khái niệm cơ bản của DataCenter, ta có 2 loại traffic là

- `North-South traffic`: Traffic đi ra ngoài cluster trên DataCenter
- `East-West traffic`: Traffic nội bộ bên trong giữa các Node với nhau

Để Routing trong và ngoài hệ thống mạng, ta sẽ có 2 mô hình là Single-Tier và Multi-Tier khi cấu hình NSX-T.

![image](https://user-images.githubusercontent.com/17109300/123466489-935ffd00-d619-11eb-9e02-cf924a4e58c9.png)

Trong NSX-T có 2 loại gateway tương ứng là Tier-0 Gateway và Tier-1 Gateway, với 2 loại gateway này ta sẽ có mô hình routing giữa Cluster với hệ thống bên ngoài. Các gateway hoạt động giữa vào các Edge Node, về cơ bản nó giống như một thiết bị Layer 3 như Switch Layer 3 có khả năng Routing, nhưng Gateway xong NSX-T là SDN nên nó định tuyến được rất nhiều giao thức.

1. Single Tier Routing

   * Chỉ sử dụng Tier-0 gateway, gateway này sẽ kết nối tất cả các VM trong Cluster, Tier-0 có khả năng kết nối với Uplink đi ra ngoài Cluster. Mô hình này rất đơn giản, một gateway dùng cho tất cả các VM.
   
   ![image](https://user-images.githubusercontent.com/17109300/123466550-a96dbd80-d619-11eb-8144-d59490baa3af.png)

2. Multi Tier Routing

   * Việc chỉ sử dụng Tier-0 thì tất cả các VM đều có khả năng đi được lưu lượng ra ngoài Cluster, nhưng nếu ta chỉ có các VM mà chỉ giao tiếp nội bộ bên trong Cluster mà không muốn cho ra ngoài thì sao ? Tier-0 vẫn làm được bằng cách không NAT dải đó ra ngoài qua Uplink là được, tuy nhiên với concepts chuẩn của việc sinh ra Tier-0 và Tier-1, muốn độc lập hoàn toàn về mặt secure, ta sẽ có 1 loại gateway gọi là Tier-1. Loại gateway này không được cấu hình Uplink ra ngoài và traffic sẽ chỉ nội bộ trong Cluster, chúng có thể có khác vùng mạng nhưng vẫn Routing được chỉ bên trong với nhau. Tier-1 tuy là gateway nội bộ nhưng vẫn có trường hợp cần cho các VM nối vào Tier-1 được đi ra ngoài Cluster. Và ta sẽ cấu hình thêm Tier-1 nối tới Tier-0 qua CGNAT. Đây là một kỹ thuật NAT giữa các Router trong ISP (nhà cung cấp dịch vụ mạng), được ứng dụng trong NSX-T.
   
   ![image](https://user-images.githubusercontent.com/17109300/123466582-b4285280-d619-11eb-9e2b-6b2e77803030.png)
  
## Transport Zones

Một transport zone được tạo ra sẽ thiết lập một vòng biên mạng. Chỉ có các Node, các Edge nằm trong cùng một zone mới có thể thấy được Logical Switch (segments) của nhau.

Transport Zone được tạo ra nhằm mục đích để VM nhìn thấy nhau trong Transport Zone đó. Ví dụ ta có 3 Cluster

- Cluster A
  - Node A-0 (zone VNPT)
  - Node A-1 (zone VNPT)
- Cluster B
  - Node B-0  (zone VNPT)
- Cluster C
  - Node C-0 (zone Viettel)
  - Node C-1 (zone VNPT)
- Cluster D
  - Node D-0 (zone Viettel)
  - Node D-1
  - Node D-2

Chỉ các VM trong node `A-0`, `A-1`, `B-0`, `C-1` thuộc `zone VNPT` mới có thể nhìn thấy PortGroup (segments) trong zone VNPT.

Chỉ các VM trong node `C-0`, `D-0` mới có thể nhìn thấy PortGroup (segments) trong zone Viettel.

Các VM ở các node thuộc zone nào sẽ chỉ nhìn thấy PortGroup của zone đó và không nhìn thấy hoặc không thể gán sang PortGroup thuộc zone khác. Như ví dụ trên, mặc dù `Cluster C` có 2 node trong cùng một Cluster, nhưng thuộc Zone khác nhau nên cả 2 Node đó sẽ không thấy PortGroup thuộc Zone của nhau. Mặc dù chúng có cùng VDS luôn nhưng khác Zone nên sẽ không nhìn thấy nhau được.

Có 2 loại Transport Zone. Overlay và VLAN

- `Overlay`: sẽ dùng cho kết nối nội bộ bên trong giữa các node, NSX-T sẽ sử dụng giao thức GENEVE.
- `VLAN`: Sử dụng cho Underlay để kết nối thẳng với kết nối VLAN ngoài Host. Loại này thường sử dụng dùng kết nối North-South từ Uplin của NSX-T Edge tới hạ tầng vật lý.

Thuộc tính của Transport Zone

1. Một Transport Zone có thể sử dụng cho tất cả các loại Transport Node (ESXi, KVM, Bare-metal server, NSX-Edge)
1. Có 2 loại Transport Zone là (VLAN hoặc Overlay)

## Uplink profile

Các Nodes muốn giao tiếp với các Node khác sẽ phải cấu hình Uplink. Uplink này thường là các Port vật lý trên các Node. Cấu hình Uplink sẽ chọn các Port, cấu hình LAGs, Teaming giống trên VDS.

Uplink trong NSX-T có 1 tham số gọi là Transport VLAN. Network mà sử dụng Transport Zone thuộc kiểu Overlay thì nó sẽ phải đi qua một VLAN gọi là Transport VLAN

Transport Zones thuộc loại Overlay và Uplink có tham số Transport VLAN sẽ kết hợp với nhau để tạo ra 1 đường Overlay. Lưu lượng của toàn bộ các VM bên trong một Zones thuộc loại Overlay sẽ đi qua VLAN này, VLAN cấu hình trên Uplink sẽ chọn Port và Teaming policy, giống với Uplink trong VDS

## Overlay là gì

Overlay network là 1 concepts nhằm mục đích đóng gói và vận chuyển gói tin từ Host này sang Host khác. Overlay Network mang thông tin của Network từ Node hay đi sang Node khác. Ví dụ

- Node: A
  - VM: A-0 (VNI 71000)
  - VM: A-1 (VNI 72000)
- Node: B
  - VM: B-0 (VNI 71000)
  - VM: B-1 (VNI 72000)
- Node: C
  - VM: C-0 (VNI 71000)
  - VM: C-1 (VNI 72000)
  - VM: C-2 (VNI 72000)

Mỗi node sẽ chỉ có 1 port vật lý, khi một VM từ node này đi sang node khác, gói tin sẽ được đóng trong Overlay và gửi giữa các Node, về lý thuyết thì chúng là thông suốt với nhau, ví dụ các VM có VNI (ID của VXLAN) là 71000 có cùng dải với nhau sẽ nhìn thấy nhau 1 cách trong suốt, nhưng thực chất chúng đi trên một đường vật lý gọi là Overlay và được vận chuyển xuống dưới VM tương ứng

![image](https://user-images.githubusercontent.com/17109300/123466624-bf7b7e00-d619-11eb-8138-70a8e67bee30.png)

###### Giao thức GENEVE

Giao thức cung cấp tầng network Overlay. Đầu tiên hệ thống sẽ tạo ra các mạng Logical để cô lập tài nguyên Network, sử dụng giao thức Geneve, lớp này sẽ là trừu tượng giữa các Node, gói tin được đóng gói qua NIC. Geneve hoạt động bằng cách tạo Layer 2 Logical Network sau đó đóng gói qua UDP Layer 3 để gửi đi giữa các Hosts. Theo tài liệu của RFC, mục đích thiết kế ra GENEVE vì các vendor về network phát triển nhiều giao thức Overlay khác nhau, trong đó có VXLAN và NVGRE, chúng sử dụng format gần giống nhau với concepts chính là dùng 24 bit làm NI (network identifier)

![image](https://user-images.githubusercontent.com/17109300/123466643-c5715f00-d619-11eb-8a90-0461c3915dfb.png)

GENEVE sẽ thực hiện implement các giao thức này, về mặt thiết kế, nó tạo ra một giao thức mới là GENEVE giống với các giao thức trên. Nhưng trong Header sẽ chứa OPTIONAL, Nếu 2 thiết bị có hỗ trợ Offload gói tin trên thiết bị phần cứng (Hardward Offload) VXLAN hoặc NVGRE hoặc giao thức như bảng trên thì GENEVE có thể truyền packet theo đúng giao thức của Offload đó, ví dụ VXLAN, còn nếu thiết bị không hỗ trợ thì nó vẫn có thể truyền data và tự Offload không thông qua phần cứng

Gói tin của VXLAN bên dưới

![image](https://user-images.githubusercontent.com/17109300/123466661-cacea980-d619-11eb-8ce4-ad0630fbcd9f.png)

Vậy điều đó có nghĩa là các thiết bị có hỗ trợ Hardware Offload của các giao thức trên sẽ có performance tốt hơn. Những thiết bị không có Hardware Offload thì vẫn có thể dùng GENEVE để giao tiếp và gần như là một giao thức phiên dịch đứng ở giữa cho các thao thức trên

- `PowerEdge R750`
  - `Interface`: **Broadcom NetXtreme E-Series Quad-port 25Gb OCP 3.0 Ethernet Adapter**

Đây là một trong server mới với card hỗ trợ Hardward Offload VXLAN / NVGRE và VXLAN

https://docs.broadcom.com/doc/12395116

## N-VDS

Trong NSX-T thì khi các Node join vào cụm thì sẽ được cài đặt một loại switch ảo gọi N-VDS, giống với việc khi join vào vCenter thì vCenter sẽ đẩy VDS xuống các Host. N-VDS trong NSX-T là một loại switch tương tự như VDS nhưng được thiết kế với các chức năng tương đương trong NSX-T, GENEVE Overlay là một ví dụ.

Tuy nhiên từ các bản trước 3.0. N-VDS được cài riêng biệt với VDS, nghĩa là N-VDS được quản lý bởi NSX-T Manager và VDS vẫn thuộc quản lý của vCenter. Từ 3.0 trở đi thì VMware đã thiết kế để tận dụng VDS bằng cách thêm một tùy chọn là cài N-VDS trên VDS, tức là N-VDS vẫn được cài riêng nhưng sẽ build-on-top của VDS. Tận dụng được VDS, về bản chất chúng vẫn riêng biệt với nhau, nhưng cấu hình lại giúp cho chúng liên quan với nhau. Thiết kế này giúp đơn giản hóa việc cấu hình NSX-T trên VMware vSphere hơn rất nhiều.

N-VDS là một V-Switch Software của NSX-T Manager xuống các Node

N-VDS built-on-top VDS chỉ hoạt động nếu NSX-T là 3.0 và vSphere VDS là 7.0 trở lên

## Segments (logical switch)

Một Segments được tạo tương đương với việc tạo PortGroup trên vCenter, nhưng Segments ở NSX-T không chỉ tạo ra Port, chúng tạo ra Logical Switch.

![image](https://user-images.githubusercontent.com/17109300/123466735-e46ff100-d619-11eb-9da3-fb80f88f5d10.png)

Với việc sử dụng VDS trên vCenter, các PortGroup cùng VLAN sẽ đều thông suốt với nhau, gói tin thuần túy luôn là Layer 2 và được truyền thẳng tới VM -> VDS -> VM luôn. Trên NSX thì tạo ra logical switch. Điều này có nghĩa là VM sẽ vẫn truyền thẳng Layer 2, nhưng nếu có cấu hình Routing hoặc Firewall Policy thì switch này sẽ hỗ trợ forward gói tin ở Layer 2 theo rule của NSX.

Ví dụ cho use-case của thiết kế này đó là khi 2 VM cùng Segments, chúng có thể giao tiếp với nhau bằng cách cho cùng dải mạng và cùng ở Layer 2, nhưng nếu muốn đặt một Firewall rule ở giữa 2 VM trên cùng Segments (NSX-T PortGroup), thậm chí 2 VM này cùng nằm trên một ESXI node, rule vẫn sẽ được áp dụng cho 2 VM này

![image](https://user-images.githubusercontent.com/17109300/123466755-ea65d200-d619-11eb-95be-37a33e74f5c7.png)

- Bài viết gốc: https://blogs.vmware.com/networkvirtualization/2016/06/micro-segmentation-defined-nsx-securing-anywhere.html/

## Transport Nodes

Khi tất cả những Policy ở trên đã khởi tạo và định nghĩa ra. Các Node sẽ phải được apply vào. NSX-T hỗ trợ ESXI Node và thậm chí là cả các hệ thống ảo hóa khác như KVM hoặc một node chạy Linux OS như CentOS, Ubuntu. Tuy nhiên ta sẽ chỉ nói về hai Transport Node của VMware chính đó là

###### vSphere ESXi Node

Ở phần N-VDS thì ESXi Node có thể cấu hình VDS và N-VDS built-on-top VDS. Một ESXi Node có N-VDS có nghĩa là nó đã trở thành một Transport Node và có thể nhận các chức năng, cấu hình của NSX-T. ESXi Node là Transport Node thì sẽ gọi là `Host Transport Node`

###### NSX-T Edge Node

Trong đó Edge Node đóng vai trò gần giống như một Router Layer 3-7 cấp cao, Edge Node cũng đóng vai trò làm Gateway cho traffic giữa các Cluster hoặc traffic đi ra ngoài. Edge Node có thể deploy dưới dạng máy ảo với 4 sizing như sau

https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-22F87CA8-01A9-4F2E-B7DB-9350CA60EA4E.html

Với mỗi sizing càng cao thì khả năng chịu tải tốt hơn cũng như có thể sử dụng nhiều tính năng của NSX-T hơn.

Edge Node có thể cấu hình VLAN Uplink đi ra ngoài Cluster và chỉ có Edge Node mới làm được điều này, nếu không có Edge Node thì các VM trong các Transport Node không thể nào đi ra ngoài hoặc đi sang Segments khác được. Edge Node chỉ thực hiện chức năng Network Workload, nó không chứa VM gì bên trong.

> *Core của NSX-T sử dụng Docker và công nghệ Container*

NSX-T khi được deploy và được cài N-VDS cũng sẽ trở thành một Transport Node, gọi là `Edge Transport  Node`

## Logical Router

Bao gồm Service Router (SR) và Distributed Routing (DR). Router này hoạt động nếu Node được gắn vào Tier-0/1 Gateway

## Service Router (SR) và Distributed Routing (DR)

###### Distributed Routing (DR)

DR sẽ được khởi tạo và chạy trên tất cả các Transport Node, đúng như tên gọi của nó, Routing giữa các VM khi đi qua Gateway mà trong cùng các Node trong Cluster, nó sẽ route đến tất cả các Node, trong trường hợp ta có 2 VM ở 2 Segments khác nhau, có thể hiểu như 2 vùng mạng khác nhau thì luồng của chúng đi như sau

- `Host A`: VM 1 (Segment A)
- `Host B`: VM 2 (Segment B)
```
|--------------------------------------------------------------------------------------------------------
|   VM 1   | => | Logical Switch | => | T0-1 Gateway              | => | Logical Switch | => |   VM 2   |
| (Host A) |    |    (Host A)    |    |   (Logical Router)        |    |    (Host B)    |    | (Host B) |
|          |    |                |    |     (Distributed Routing) |    |                |    |          |
|--------------------------------------------------------------------------------------------------------
```

###### Service Router (SR)

Chịu trách nhiệm thực hiện các nhiệm vụ sau

1. Connectivity to physical infrastructure
1. NAT
1. DHCP server
1. MetaData Proxy
1. Edge Firewall
1. Load Balancer

SR hoạt động trong Edge Node khi Edge Node link tới Tier-0 gateway. Chủ yếu thực hiện các chức năng mạng dạng statefull như trên

![image](https://user-images.githubusercontent.com/17109300/123466775-f5206700-d619-11eb-98b4-f94676ebae54.png)

Hình trên mô tả về SR, sử dụng NAT ra ngoài Internet qua Edge Node. Edge Node ở hình trên được gắn Uplink nối ra ngoài WAN Internet, trong ví dụ này khi đi ra ngoài Internet ta sẽ phải NAT, mà mỗi lần NAT ra IP Public từ IP Private thì đi ra từ đường nào sẽ phải đi vào bằng đường đó. Vậy Service Router là một use-case như vây.

###### Kết hợp giữa SR và DR

Ở mô tả về SR thì SR có thể dùng để kết nối ra ngoài, nhưng để kết nối được ra ngoài. Chúng vẫn phải đi qua DR.  Trong hình dưới ta thấy 2 VM Web-LS có IP là 172.16.10.11 và 172.16.10.12, để đi ra được mạng khác hay là ra ngoài thì chúng phải có Gateway IP, Gateway IP này nằm trên Logical Router có địa chỉ là 172.16.10.1. Địa chỉ này chính là DR, trong trường hợp kết nối giữa 2 Segments nội bộ thì DR thì định tuyến sang dải mạng ở Segments mà DR có thể định tuyến tới, trong hình thì ta thấy có App-LS có IP là 172.16.20.11 và gateway là 172.16.20.1. Nếu đi từ Web-LS (172.16.10.x) tới App-LS (172.16.20.x) thì chúng đi như sau

```
|----------------------------------------------------------------------------------------------------
| Web-LS | => | Logical Switch | => | T0-1 Gateway              | => | Logical Switch | => | App-LS |
|        |    |                |    |   (Logical Router)        |    |                |    |        |
|        |    |                |    |     (Distributed Routing) |    |                |    |        |
|----------------------------------------------------------------------------------------------------
```

Tiếp đến là từ Web-LS đi ra bên ngoài. Chính là cái Physical Router kia, chúng sẽ đi theo flow trên nhưng phải đi qua SR từ DR. Từ DR tới SR, Logical Router sẽ phải Route qua một Transit link bằng việc sử dụng một dải IP Linklocal IPv4 là 169.254.0.0/28. Về bản chất thì SR và DR cùng nằm trong một Logical Router nên việc sử dụng Linklocal IPv4 để transit giữa 2 loại Routing này là hoàn toàn hợp lý

```
|-------------------------------------------------------------------------------------------------
| Web-LS | => | Logical Switch | => | T0-1 Gateway                               |    |          |
|        |    |                |    |   (Logical Router) =======>>>> Transit LS  |    | Physical |
|        |    |                |    |     (Distributed Routing) ==== 169.254.0.1 |    | Router   |
|        |    |                |    |     (Service Router)========== 169.254.0.2 | => | Uplink   |
|-------------------------------------------------------------------------------------------------
```

![image](https://user-images.githubusercontent.com/17109300/123466821-fce00b80-d619-11eb-9b18-1ab4d45a7125.png)

> Lưu ý, phần này chỉ mô tả về Logical Router ở bên trong khi gói tin chạy trong một Gateway, không phải là giữa T0 và T1 Gateway

## Edge Bridge

Sử dụng để bridge từ hệ thống mạng vật lý hoặc bên ngoài hạ tầng NSX-T trực tiếp qua Layer 2. Use case đó là bridge hạ tầng ngoài và hạ tầng bên trong khi chúng cùng dải mạng. Xem ví dụ bên hình dưới .

![image](https://user-images.githubusercontent.com/17109300/123466837-02d5ec80-d61a-11eb-8a01-515fa27c2c18.png)

Tính năng này sử dụng trong Use-case khi hệ thống mạng cùng sử dụng cả mô hình VLAN cũ truyền thống kết hợp với NSX. Ví dụ có 6 VM chạy ứng dụng ở hệ thống mạng X, tiếp đó ta chạy ảo hóa và đưa được 3 VM sang ảo hóa, sau đó cho 3 VM này đưa vào NSX-T để chạy Network của NSX. Tuy nhiên kết nối của nhóm 3 VM ở hạ tầng cũ và nhóm 3 VM ở NSX không thể thay đổi cấu hình bên trong máy ảo vì một lý do nào đó, nên kết nối của chúng vẫn là kết nối cũ, ví dụ từ App kết nối sang Database cùng dải mạng cũ, không thể thay đổi thay đổi cấu hình này, phải giữ nguyên. Vậy ta sẽ dùng Bridge từ Edge (vì Edge Node mới có Uplink ra ngoài được), sau đó bridge uplink đó sang hệ thống mạng VLAN cũ, vậy là Edge Node đóng vai trò là thiết bị Bridge, 3 VM bên trong NSX có thể là bất cứ Overlay Segment nào, nhưng đi qua Bridge của Edge Node, gói tin sẽ được truyền qua Layer 2 qua Edge Node và tới được hệ thống mạng VLAN cũ.

3 VM ở hệ thống mạng VLAN cũ sẽ chỉ giao tiếp được với VM ở nhóm được Bridge trong NSX, mặc dù cùng dải mạng và được Bridge với nhau qua Edge Node nhưng 3 VM ở ngoài kia không nằm trong Transport Node cũng như không nằm trong Transport Zone nên không thể giao tiếp được với các hệ thống khác trong NSX. Tuy nhiên 3 VM ở trong nếu có Route sang các Segments khác thì chúng vẫn giao tiếp được với nhau, chỉ 3 VM ở ngoài là giao tiếp riêng biệt với 3 bên trong NSX.

# Cấu hình tổng quan

## Flow Diagram

![image](https://user-images.githubusercontent.com/17109300/123466860-0bc6be00-d61a-11eb-8f4b-77f30d823f94.png)
