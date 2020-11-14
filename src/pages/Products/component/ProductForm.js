import React, {useEffect} from 'react';
import {isEmpty} from 'lodash';

import {Button, Form, Input, Select} from 'antd';

const {Option} = Select;
const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const ProductForm = ({
                         selectedProduct,
                         categories,
                         onUpdateClick,
                         onAddClick
                     }) => {
    const [form] = Form.useForm();
   const updateProducts =()=>{
       console.log("update")
        /*this.socket.emit('update', JSON.stringify({
            id:'5fafe994a318df2d3004ccdb',
            name:"at",
            img: "deneme",
            price: 12345,
            createdAt: "22.12.2020"}));*/
    };


    useEffect(() => {
        form.resetFields();

        if (!isEmpty(selectedProduct)) {
            form.setFieldsValue({
                ...selectedProduct,
            });
        }
    }, [selectedProduct]);

    const onFinish = (values) => {

        if (!isEmpty(selectedProduct)) {
            const {
                _id
            }= selectedProduct
            onUpdateClick({
                ...values,
                _id
            })
        } else {
            onAddClick(values)
        }
    };

    return (
        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
            <Form.Item
                name="name"
                label="Name"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                name="price"
                label="Price"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                name="category"
                label="Category"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select
                    placeholder="Select category"
                    allowClear
                >
                    {
                        categories.map((item) => <Option value={item.id}>{item.label}</Option>)
                    }
                </Select>
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" >
                    {
                        !isEmpty(selectedProduct) ? 'Update' : 'Save'
                    }
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ProductForm
