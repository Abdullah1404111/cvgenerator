@extends('layouts.admin_app')


@section('content')
<div class="container">
  <div class="row">
    <div class="col-lg-8 offset-lg-2">
      @if ($errors->any())
          <div class="alert alert-danger fade show">
              <ul style="margin: 0;">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                  @foreach ($errors->all() as $error)
                      <li>{!! $error !!}</li>
                  @endforeach
              </ul>
          </div>
      @endif
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0 h6">Edit product . . .</h5>
        </div>
        <div class="card-body">
          <form action="{{ route('product.update', ['product' => $product->id]) }}" method="post" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            <div class="form-group">
              <label>Product Name</label>
              <input type="text" class="form-control" name="name" placeholder="Enter product name . . ." value="{{ $product->name }}">
            </div>
            <div class="form-group">
              <label>Product Category</label>
              <input type="text" class="form-control" name="category" placeholder="Enter Category name . . ." value="{{ $product->category }}">
            </div>
            <div class="form-group">
              <label>Product description</label>
              <textarea name="description" class="form-control resize-off" rows="3" placeholder="Enter Product details . . .">{{ $product->description }}</textarea>
            </div>

            <div class="form-group">
              <label>Image of product</label>
              <div class="custom-file custom-file-sm">
                <label class="custom-file-label">
                  <input type="file" onchange="showImage.call(this)" class="custom-file-input" name="image">
                  <input type="hidden" name="existingImage" value="{{ $product->image }}">
                </label>
              </div>
              <img src="" class="pt-2 rounded m-auto" style="display: none; height:150px; width: 150px;"  id="image">
            </div>

            <div class="col-md-12 text-md-right">
              <button type="submit" class="btn btn-primary form-control">
                <i class="las la-plus"></i>
                <span>Update Product!</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <script type="text/javascript">
  function showImage()
  {
    if (this.files && this.files[0]) {
      var obj = new FileReader();
      obj.onload = function(data) {
        var image = document.getElementById("image");
        // alert(data.target.result);
        image.src = data.target.result;
        image.style.display = "block";
      }

      obj.readAsDataURL(this.files[0]);
    }
  }
  </script>
</div>
@endsection
