import React, {Component} from 'react';
import io from 'socket.io-client';
import {Button, Drawer, Layout, Menu, Modal, Space, Table, message} from 'antd';
import ProductForm from "./component/ProductForm";
import CategoryForm from "./component/CategoryForm";

const {confirm} = Modal;

const {Header, Content, Footer} = Layout;

class Index extends Component {
    state = {
        products: [],
        categories: [
            {
                id: 0,
                label: 'Category 1'
            }, {
                id: 1,
                label: 'Category 2'
            }, {
                id: 2,
                label: 'Category 3'
            },
        ],
        selectedProduct: null,
        isDrawerVisible: false,
        isCategoryCreating: false,
        productData: []
    };
    socket = null;


    // Place socket.io code inside here
    componentDidMount() {
        const connectionConfig = {
            transports: ['websocket'],
        };
        this.server = 'http://localhost:8080';
        this.socket = io.connect(this.server,connectionConfig);
        this.socket.on('visitor enters', data => this.setState({ online: data.online }));
        this.socket.on('visitor exits', data => this.setState({ online: data.online }));
        this.socket.on('productChange', data => {
            this.socket.emit('products', data => this.setState({ productData: JSON.parse(data) }));
        });
        this.socket.emit('productChange', data => 'this.setState({ products: JSON.parse(data) })' );
        this.socket.emit('products', data => 'this.setState({ products: JSON.parse(data) })' );
        this.getProducts();
    }

    getProducts(){
        this.socket.on('products', data => this.setState({ productData: JSON.parse(data) }));

    }
    updateProducts = (values) =>{
        //console.log("update",values);
        this.socket.emit('update', JSON.stringify({
            id:values._id,
            name:values.name,
            img: "deneme",
            price:values.price,
            category:values.category}));
        this.setDrawerState(false);
        message.success('Product successfully updated');

    };

    addProducts = (values) =>{
        this.socket.emit('create', JSON.stringify({
            name:values.name,
            img: "deneme",
            price:values.price,
            category:values.category}));
       this.setDrawerState(false);
        message.success('Product successfully added');
    };
    getInitialState = () => {
        this.setState({
            isDrawerVisible: false,
        }, () => setTimeout(() => this.setState({
            selectedProduct: null,
            isCategoryCreating: false,
        }), 150));
    };

setDrawerState=(isDrawerVisible)=>{
    this.setState({isDrawerVisible})
}

    render() {
        const {
            isDrawerVisible,
            selectedProduct,
            categories,
            productData,
            isCategoryCreating,
        } = this.state
        return (
            <>
                <Drawer
                    visible={isDrawerVisible}
                    title={!selectedProduct ? 'Create Product' : 'Edit Product'}
                    onClose={this.getInitialState}
                    width={"30%"}
                >
                   <ProductForm
                            categories={categories}
                            selectedProduct={selectedProduct}
                            onUpdateClick={this.updateProducts}
                            onAddClick={this.addProducts}
                        />
                </Drawer>
                <Layout className="layout">
                    <Header>
                        <div className="logo"/>
                        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['/']}>
                            <Menu.Item key="/">Products</Menu.Item>
                        </Menu>
                    </Header>
                    <Content style={{padding: '0 50px'}}>
                        <div className="site-layout-content">
                            <Space size="middle" className="table-buttons">
                                <Button
                                    type="primary"
                                    onClick={this.onCreateNewProductClick}
                                >
                                    Create Product
                                </Button>
                                {/*<Button
                                    type="primary"
                                    onClick={this.onCreateNewCategoryClick}
                                >
                                    Add New Category
                                </Button>*/}
                            </Space>
                            <Table columns={this.getColumns()} dataSource={productData}/>
                        </div>
                    </Content>
                    <Footer style={{textAlign: 'center'}}>
                        <b>CRUD App with Socket.io</b>
                        <br/>
                        Alican Edebali
                    </Footer>
                </Layout>
            </>
        )
    }

    onProductEditClick = (selectedProduct) => {
        //console.log("edit selected",selectedProduct);
        this.setState({
            isDrawerVisible: true,
            selectedProduct,
        })
    }

    onCreateNewProductClick = () => {
        this.setState({
            isDrawerVisible: true,
            selectedProduct: null,
        })
    }

    onCreateNewCategoryClick = () => {
        this.setState({
            isDrawerVisible: true,
            isCategoryCreating: true,
        })
    }

    onDeleteClick = (id) => {
        confirm({
            centered: true,
            title: 'Please confirm to delete',
            okText: 'Delete',
            cancelText: 'Cancel',
            onOk: () => this.onDeleteConfirm(id)
        })
    };

    onDeleteConfirm = (id) => {
            this.socket.emit('delete', JSON.stringify({
                id:id}));
        message.success('Product successfully deleted');
    };

    getColumns = () => {
        const columns = [
            {
                title: 'Image',
                dataIndex: 'img',
                key: 'img',
                width: 50,
                render: uri => <img src={uri} className="product-image"/>
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
            },
            {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <Space size="middle">
                        <a onClick={() => this.onProductEditClick(record)}>
                            Edit
                        </a>
                        <a
                            onClick={() => this.onDeleteClick(record._id)}
                        >
                            Delete
                        </a>
                    </Space>
                ),
            },
        ];

        return columns
    }
}

export default Index;
