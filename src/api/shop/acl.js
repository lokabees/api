const permissions = [
    {
        group: 'guest',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET'],
                action: 'allow',
                view: ['name', 'slug', 'contact', 'description', 'address', 'openingHours', 'isOpen', 'author', 'author.name', 'categories', 'images']
            }
        ]
    },
    {
        group: 'user',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['_id', 'name', 'slug', 'contact', 'description', 'address', 'author', 'published', 'openingHours', 'isOpen', 'author', 'author.name', 'author.email', 'author.picture', 'categories', 'images']
            }
        ]
    },
    {
        group: 'admin',
        permissions: [
            {
                resource: 'shops/*',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                action: 'allow',
                view: ['_id', 'name', 'slug', 'contact', 'description', 'address', 'author', 'published', 'openingHours', 'isOpen', 'author', 'author.name', 'author.email', 'author.picture', 'categories', 'images']
            }
        ]
    }
]

export default permissions
